package com.postispop.android;

import android.Manifest;
import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.content.pm.PackageManager;
import android.webkit.*;
import android.widget.FrameLayout;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import android.view.View;
import android.view.WindowInsets;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.core.content.FileProvider;
import org.json.JSONObject;
import android.util.Base64;
import java.io.*;
import java.util.*;

/** Runs only APK-bundled UI. Supabase requests remain authenticated network requests. */
public final class MainActivity extends ComponentActivity {
    private static final String HOST = "postispop.com";
    private static final String HOME_URL = "https://" + HOST + "/";
    private WebView web;
    private ValueCallback<Uri[]> fileResult;
    private static final int MAX_DOWNLOAD_BYTES = 10000000;
    private static final int MAX_SHARE_BYTES = 10000000;
    private PendingDownload pendingDownload;
    private PermissionRequest pendingWebPermission;
    private String[] pendingWebResources = new String[0];

    private static final class PendingDownload {
        final String id;
        final byte[] bytes;
        final JavaScriptReplyProxy reply;
        PendingDownload(String id, byte[] bytes, JavaScriptReplyProxy reply) {
            this.id = id; this.bytes = bytes; this.reply = reply;
        }
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(getColor(R.color.paper));
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        web = new WebView(this);
        // Release WebViews cannot be inspected through remote debugging.
        WebView.setWebContentsDebuggingEnabled(false);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() {
                if (web != null && web.canGoBack()) web.goBack(); else finish();
            }
        });
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Only user-selected content URIs; navigation stays HTTPS/local.
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSupportMultipleWindows(false);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);
        final WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
                .setDomain(HOST).addPathHandler("/", this::localAsset).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (isLocal(uri)) {
                    WebResourceResponse response = assets.shouldInterceptRequest(uri);
                    return response != null ? response : missing();
                }
                // No remote document is ever rendered inside the app.
                if (request.isForMainFrame()) return missing();
                return null;
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return route(request.getUrl());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) { return route(Uri.parse(url)); }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                // Android can reclaim a background WebView independently of
                // this Activity. Never keep using that destroyed renderer.
                if (web != view) return true;
                if (fileResult != null) { fileResult.onReceiveValue(null); fileResult = null; }
                pendingDownload = null;
                pendingWebPermission = null;
                pendingWebResources = new String[0];
                root.removeView(view);
                view.destroy();
                web = null;
                LinearLayout recovery = new LinearLayout(MainActivity.this);
                recovery.setOrientation(LinearLayout.VERTICAL);
                recovery.setGravity(android.view.Gravity.CENTER);
                int padding = (int) (24 * getResources().getDisplayMetrics().density);
                recovery.setPadding(padding, padding, padding, padding);
                TextView explanation = new TextView(MainActivity.this);
                explanation.setText(R.string.recover_explanation);
                explanation.setTextSize(18);
                explanation.setGravity(android.view.Gravity.CENTER);
                recovery.addView(explanation);
                Button reopen = new Button(MainActivity.this);
                reopen.setText(R.string.reopen_notes);
                reopen.setOnClickListener(button -> recreate());
                recovery.addView(reopen);
                root.addView(recovery, new FrameLayout.LayoutParams(-1, -1));
                // Let the user retry explicitly rather than looping on a
                // resource that caused a renderer crash.
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileResult != null) fileResult.onReceiveValue(null);
                fileResult = callback;
                try { startActivityForResult(params.createIntent(), 10); }
                catch (ActivityNotFoundException e) { fileResult.onReceiveValue(null); fileResult = null; }
                return true;
            }
            @Override public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> {
                    if (!isLocal(request.getOrigin()) || pendingWebPermission != null) { request.deny(); return; }
                    List<String> androidPermissions = new ArrayList<>(), webResources = new ArrayList<>();
                    for (String resource : request.getResources()) {
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                            androidPermissions.add(Manifest.permission.RECORD_AUDIO); webResources.add(resource);
                        } else if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                            androidPermissions.add(Manifest.permission.CAMERA); webResources.add(resource);
                        }
                    }
                    if (webResources.isEmpty()) { request.deny(); return; }
                    List<String> missing = new ArrayList<>(), allowed = new ArrayList<>();
                    for (int i = 0; i < androidPermissions.size(); i++) {
                        String permission = androidPermissions.get(i);
                        if (checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED) allowed.add(webResources.get(i));
                        else if (!missing.contains(permission)) missing.add(permission);
                    }
                    if (missing.isEmpty()) { request.grant(allowed.toArray(new String[0])); return; }
                    pendingWebPermission = request;
                    pendingWebResources = webResources.toArray(new String[0]);
                    requestPermissions(missing.toArray(new String[0]), 12);
                });
            }
            @Override public void onPermissionRequestCanceled(PermissionRequest request) {
                if (pendingWebPermission == request) { pendingWebPermission = null; pendingWebResources = new String[0]; }
            }
        });
        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            WebViewCompat.addWebMessageListener(web, "PostisPopFiles", Collections.singleton("https://" + HOST),
                (view, message, origin, mainFrame, reply) -> {
                    if (!mainFrame || !isLocal(origin)) return;
                    try { prepareDownload(message.getData(), reply); }
                    catch (Exception e) { replyDownload(reply, "", "error", "NATIVE_DOWNLOAD_INVALID"); }
                });
            WebViewCompat.addWebMessageListener(web, "PostisPopShare", Collections.singleton("https://" + HOST),
                (view, message, origin, mainFrame, reply) -> {
                    if (!mainFrame || !isLocal(origin)) return;
                    new Thread(() -> prepareShare(message.getData(), reply)).start();
                });
        }
        web.setDownloadListener((url, agent, disposition, type, size) -> {
            if (web != null && isLocal(Uri.parse(web.getUrl())) && (url.startsWith("blob:https://" + HOST + "/") || url.startsWith("data:image/png;base64,"))) {
                // Older download links use the same acknowledged path. A
                // rejected save must be visible rather than silently ignored.
                web.evaluateJavascript("(async()=>{try{if(!window.__postispopSaveDownload)throw Error('No se pudo preparar el archivo. Vuelve a abrir la aplicación.');await window.__postispopSaveDownload(" + JSONObject.quote(url) + ");}catch(error){window.alert(error.message);}})()", null);
            }
        });
        // A fresh app link (including an OAuth callback) takes precedence over
        // an older saved navigation history after process recreation.
        if (isLocal(getIntent().getData())) openIntent(getIntent());
        else if (state == null || web.restoreState(state) == null) openIntent(getIntent());
    }

    private void replyDownload(JavaScriptReplyProxy reply, String id, String status, String error) {
        try {
            JSONObject result = new JSONObject().put("id", id).put("status", status);
            if (error != null) result.put("error", error);
            if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
                reply.postMessage(result.toString());
            }
        } catch (Exception ignored) {
            // The originating document may have closed while its picker was open.
        }
    }

    private void prepareDownload(String raw, JavaScriptReplyProxy reply) {
        String id = "";
        try {
            if (raw == null || raw.length() > 14000000) {
                replyDownload(reply, id, "error", "NATIVE_DOWNLOAD_TOO_LARGE"); return;
            }
            JSONObject file = new JSONObject(raw);
            id = file.getString("id");
            if (!id.matches("[A-Za-z0-9_-]{1,80}")) {
                replyDownload(reply, "", "error", "NATIVE_DOWNLOAD_INVALID"); return;
            }
            if (pendingDownload != null) {
                replyDownload(reply, id, "error", "NATIVE_DOWNLOAD_BUSY"); return;
            }
            String data = file.getString("dataUrl");
            final String mime;
            if (data.startsWith("data:image/png;base64,")) mime = "image/png";
            else if (data.startsWith("data:application/json;base64,")) mime = "application/json";
            else { replyDownload(reply, id, "error", "NATIVE_DOWNLOAD_TYPE"); return; }
            String encoded = data.substring(data.indexOf(',') + 1);
            if (encoded.length() > ((MAX_DOWNLOAD_BYTES + 2) / 3) * 4) {
                replyDownload(reply, id, "error", "NATIVE_DOWNLOAD_TOO_LARGE"); return;
            }
            byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
            if (bytes.length > MAX_DOWNLOAD_BYTES) {
                replyDownload(reply, id, "error", "NATIVE_DOWNLOAD_TOO_LARGE"); return;
            }
            String filename = "image/png".equals(mime) ? "PostisPop-pizarra.png"
                : "PostisPop-contadores.json".equals(file.optString("filename")) ? "PostisPop-contadores.json" : "PostisPop-copia.json";
            Intent save = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                .setType(mime).putExtra(Intent.EXTRA_TITLE, filename);
            pendingDownload = new PendingDownload(id, bytes, reply);
            try { startActivityForResult(save, 11); }
            catch (Exception e) {
                pendingDownload = null;
                replyDownload(reply, id, "error", "NATIVE_DOWNLOAD_PICKER_UNAVAILABLE");
            }
        } catch (Exception e) { replyDownload(reply, id, "error", "NATIVE_DOWNLOAD_INVALID"); }
    }

    private void replyShare(JavaScriptReplyProxy reply, String id, String status, String error) {
        try {
            JSONObject result = new JSONObject().put("id", id).put("status", status);
            if (error != null) result.put("error", error);
            if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) reply.postMessage(result.toString());
        } catch (Exception ignored) { }
    }

    private void prepareShare(String raw, JavaScriptReplyProxy reply) {
        String id = "";
        try {
            if (raw == null || raw.length() > 14000000) throw new IllegalArgumentException("NATIVE_SHARE_TOO_LARGE");
            JSONObject request = new JSONObject(raw);
            id = request.getString("id");
            if (!id.matches("[A-Za-z0-9_-]{1,80}")) throw new IllegalArgumentException("NATIVE_SHARE_INVALID");
            String filename = request.optString("filename", "").replaceAll("[^A-Za-z0-9._-]", "_");
            if (filename.length() > 120) filename = filename.substring(filename.length() - 120);
            String mime = request.optString("mimeType", "");
            String text = request.optString("text", "");
            String title = request.optString("title", "PostisPop");
            if (text.length() > 4000 || title.length() > 120) throw new IllegalArgumentException("NATIVE_SHARE_INVALID");
            String data = request.optString("dataUrl", "");
            File sharedFile = null;
            Uri contentUri = null;
            if (!data.isEmpty()) {
                if (filename.isEmpty() || !mime.matches("[A-Za-z0-9!#$&^_.+-]+/[A-Za-z0-9!#$&^_.+-]+") || !data.startsWith("data:" + mime + ";base64,"))
                    throw new IllegalArgumentException("NATIVE_SHARE_TYPE");
                byte[] bytes = Base64.decode(data.substring(data.indexOf(',') + 1), Base64.DEFAULT);
                if (bytes.length == 0 || bytes.length > MAX_SHARE_BYTES) throw new IllegalArgumentException("NATIVE_SHARE_TOO_LARGE");
                File directory = new File(getCacheDir(), "postispop-share");
                if (!directory.exists() && !directory.mkdirs()) throw new IOException("SHARE_CACHE_UNAVAILABLE");
                File[] old = directory.listFiles();
                if (old != null) for (File item : old) if (System.currentTimeMillis() - item.lastModified() > 3600000L) item.delete();
                sharedFile = new File(directory, UUID.randomUUID().toString() + "-" + filename);
                try (FileOutputStream output = new FileOutputStream(sharedFile)) { output.write(bytes); }
                contentUri = FileProvider.getUriForFile(this, getPackageName() + ".shareprovider", sharedFile);
            } else if (text.trim().isEmpty()) throw new IllegalArgumentException("NATIVE_SHARE_INVALID");
            final File file = sharedFile;
            final Uri uri = contentUri;
            final String requestId = id, shareText = text, shareTitle = title;
            final String shareMime = file == null ? "text/plain" : mime;
            runOnUiThread(() -> {
                try {
                    Intent send = new Intent(Intent.ACTION_SEND).setType(shareMime);
                    if (!shareText.isEmpty()) send.putExtra(Intent.EXTRA_TEXT, shareText);
                    if (uri != null) {
                        send.putExtra(Intent.EXTRA_STREAM, uri);
                        send.setClipData(android.content.ClipData.newUri(getContentResolver(), file.getName(), uri));
                        send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    }
                    startActivity(Intent.createChooser(send, shareTitle));
                    replyShare(reply, requestId, "opened", null);
                } catch (Exception error) {
                    if (file != null) file.delete();
                    replyShare(reply, requestId, "error", "NATIVE_SHARE_UNAVAILABLE");
                    Toast.makeText(this, R.string.no_link_app, Toast.LENGTH_LONG).show();
                }
            });
        } catch (IllegalArgumentException error) {
            String message = error.getMessage();
            replyShare(reply, id, "error", message != null && message.startsWith("NATIVE_SHARE_") ? message : "NATIVE_SHARE_INVALID");
        } catch (Exception error) {
            replyShare(reply, id, "error", "NATIVE_SHARE_UNAVAILABLE");
        }
    }

    private boolean isLocal(Uri uri) {
        return uri != null && "https".equals(uri.getScheme()) && HOST.equals(uri.getHost()) && (uri.getPort() == -1 || uri.getPort() == 443);
    }
    private boolean route(Uri uri) {
        if (isLocal(uri)) return false;
        if (Arrays.asList("https", "mailto", "tel").contains(uri.getScheme())) {
            try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
            catch (ActivityNotFoundException e) { Toast.makeText(this, R.string.no_link_app, Toast.LENGTH_LONG).show(); }
        }
        return true;
    }
    private WebResourceResponse localAsset(String path) {
        if (path.contains("..") || path.contains("\\")) return missing();
        if (path.isEmpty() || path.endsWith("/")) path += "index.html";
        if (Arrays.asList("privacy", "terms", "legal", "cookies").contains(path)) path += ".html";
        try {
            InputStream stream = getAssets().open("www/" + path);
            String ext = path.substring(path.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
            String mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
            if (ext.equals("js") || ext.equals("mjs")) mime = "text/javascript";
            if (ext.equals("wasm")) mime = "application/wasm";
            if (ext.equals("svg")) mime = "image/svg+xml";
            if (ext.equals("woff")) mime = "font/woff";
            if (ext.equals("woff2")) mime = "font/woff2";
            if (ext.equals("ttf")) mime = "font/ttf";
            if (mime == null) mime = "application/octet-stream";
            Map<String,String> headers = new HashMap<>();
            headers.put("Cache-Control", "no-cache");
            headers.put("X-Content-Type-Options", "nosniff");
            headers.put("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' blob: data:; font-src 'self'; connect-src 'self' https://htfyjefmviwlgmfqrwue.supabase.co wss://htfyjefmviwlgmfqrwue.supabase.co; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'");
            return new WebResourceResponse(mime, "UTF-8", 200, "OK", headers, stream);
        } catch (IOException e) { return missing(); }
    }
    private WebResourceResponse missing() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", Collections.emptyMap(),
                new ByteArrayInputStream(getString(R.string.resource_unavailable).getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    }
    private void openIntent(Intent intent) {
        Uri uri = intent.getData();
        web.loadUrl(uri != null && isLocal(uri) ? uri.toString() : HOME_URL);
        // The URL is now owned by the WebView. Do not replay a one-time OAuth
        // code from the Activity intent after a later recreation.
        if (uri != null) setIntent(new Intent(intent).setData(null));
    }
    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        // singleTask also delivers launcher taps here. A tap without a deep
        // link must not reload the board and discard the open editor state.
        if (isLocal(intent.getData())) {
            if (web == null) recreate(); else openIntent(intent);
        }
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == 11 && pendingDownload != null) {
            PendingDownload download = pendingDownload; pendingDownload = null;
            if (result != RESULT_OK) replyDownload(download.reply, download.id, "cancelled", null);
            else if (data == null || data.getData() == null) replyDownload(download.reply, download.id, "error", "NATIVE_DOWNLOAD_WRITE_FAILED");
            else {
                try (OutputStream out = getContentResolver().openOutputStream(data.getData())) {
                    if (out == null) throw new IOException("Document output unavailable");
                    out.write(download.bytes);
                } catch (Exception e) {
                    replyDownload(download.reply, download.id, "error", "NATIVE_DOWNLOAD_WRITE_FAILED");
                    Toast.makeText(this, R.string.file_save_failed, Toast.LENGTH_LONG).show();
                    return;
                }
                // Do not acknowledge until write AND close have both succeeded.
                replyDownload(download.reply, download.id, "saved", null);
                Toast.makeText(this, R.string.file_saved, Toast.LENGTH_SHORT).show();
            }
        }
        if (request == 10 && fileResult != null) {
            fileResult.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data)); fileResult = null;
        }
    }
    @Override protected void onSaveInstanceState(Bundle state) { if (web != null) web.saveState(state); super.onSaveInstanceState(state); }
    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode == 12 && pendingWebPermission != null) {
            PermissionRequest request = pendingWebPermission; pendingWebPermission = null;
            List<String> granted = new ArrayList<>();
            for (String resource : pendingWebResources) {
                String permission = PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)
                    ? Manifest.permission.RECORD_AUDIO : Manifest.permission.CAMERA;
                if (checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED) granted.add(resource);
            }
            pendingWebResources = new String[0];
            if (granted.isEmpty()) request.deny(); else request.grant(granted.toArray(new String[0]));
        }
    }
    @Override protected void onPause() {
        if (web != null) {
            // Persist pending drawing/attachment edits when Home, the file
            // picker or OAuth moves this app into the background. Ordinary
            // text edits already keep their local draft on each input.
            web.evaluateJavascript("window.dispatchEvent(new Event('postispop:native-background'))", null);
            web.onPause();
        }
        CookieManager.getInstance().flush();
        super.onPause();
    }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }
    @Override protected void onDestroy() { if (fileResult != null) fileResult.onReceiveValue(null); if (pendingWebPermission != null) pendingWebPermission.deny(); if (web != null) web.destroy(); super.onDestroy(); }
}

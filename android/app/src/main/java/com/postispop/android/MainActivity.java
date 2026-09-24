package com.postispop.android;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.*;
import android.widget.FrameLayout;
import android.widget.Toast;
import android.view.View;
import android.view.WindowInsets;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import org.json.JSONObject;
import android.util.Base64;
import java.io.*;
import java.util.*;

/** Runs only APK-bundled UI. Supabase requests remain authenticated network requests. */
public final class MainActivity extends Activity {
    private static final String HOST = "postispop.com";
    private static final String HOME_URL = "https://" + HOST + "/";
    private WebView web;
    private ValueCallback<Uri[]> fileResult;
    private byte[] pendingDownload;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xfffffdf9);
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        web = new WebView(this);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
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
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileResult != null) fileResult.onReceiveValue(null);
                fileResult = callback;
                try { startActivityForResult(params.createIntent(), 10); }
                catch (ActivityNotFoundException e) { fileResult.onReceiveValue(null); fileResult = null; }
                return true;
            }
        });
        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            WebViewCompat.addWebMessageListener(web, "PostisPopFiles", Collections.singleton("https://" + HOST),
                (view, message, origin, mainFrame, reply) -> {
                    if (!mainFrame || !isLocal(origin) || pendingDownload != null) return;
                    try {
                        String raw = message.getData();
                        if (raw == null || raw.length() > 14000000) return;
                        JSONObject file = new JSONObject(raw);
                        String data = file.getString("dataUrl");
                        if (!data.startsWith("data:image/png;base64,")) return;
                        pendingDownload = Base64.decode(data.substring(data.indexOf(',') + 1), Base64.DEFAULT);
                        Intent save = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                            .setType("image/png").putExtra(Intent.EXTRA_TITLE, "PostisPop.png");
                        startActivityForResult(save, 11);
                    } catch (Exception e) { pendingDownload = null; }
                });
        }
        web.setDownloadListener((url, agent, disposition, type, size) -> {
            if (isLocal(Uri.parse(web.getUrl())) && (url.startsWith("blob:https://" + HOST + "/") || url.startsWith("data:image/png;"))) {
                web.evaluateJavascript("window.__postispopSaveDownload?.(" + JSONObject.quote(url) + ")", null);
            }
        });
        if (state == null || web.restoreState(state) == null) openIntent(getIntent());
    }

    private boolean isLocal(Uri uri) {
        return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost()) && (uri.getPort() == -1 || uri.getPort() == 443);
    }
    private boolean route(Uri uri) {
        if (isLocal(uri)) return false;
        if (Arrays.asList("https", "mailto", "tel").contains(uri.getScheme())) {
            try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
            catch (ActivityNotFoundException e) { Toast.makeText(this, "No hay una aplicación para abrir este enlace", Toast.LENGTH_LONG).show(); }
        }
        return true;
    }
    private WebResourceResponse localAsset(String path) {
        if (path.contains("..") || path.contains("\\")) return missing();
        if (path.isEmpty() || path.endsWith("/")) path += "index.html";
        try {
            InputStream stream = getAssets().open("www/" + path);
            String ext = path.substring(path.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
            String mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
            if (ext.equals("js") || ext.equals("mjs")) mime = "text/javascript";
            if (ext.equals("wasm")) mime = "application/wasm";
            if (ext.equals("svg")) mime = "image/svg+xml";
            if (mime == null) mime = "application/octet-stream";
            Map<String,String> headers = new HashMap<>();
            headers.put("Cache-Control", "no-cache");
            headers.put("X-Content-Type-Options", "nosniff");
            headers.put("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' https://htfyjefmviwlgmfqrwue.supabase.co wss://htfyjefmviwlgmfqrwue.supabase.co; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'");
            return new WebResourceResponse(mime, "UTF-8", 200, "OK", headers, stream);
        } catch (IOException e) { return missing(); }
    }
    private WebResourceResponse missing() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", Collections.emptyMap(),
                new ByteArrayInputStream("Recurso no incluido en esta versión local".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    }
    private void openIntent(Intent intent) {
        Uri uri = intent.getData();
        web.loadUrl(uri != null && isLocal(uri) ? uri.toString() : HOME_URL);
    }
    @Override protected void onNewIntent(Intent intent) { super.onNewIntent(intent); setIntent(intent); openIntent(intent); }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == 11 && pendingDownload != null) {
            byte[] bytes = pendingDownload; pendingDownload = null;
            if (result == RESULT_OK && data != null && data.getData() != null) {
                try (OutputStream out = getContentResolver().openOutputStream(data.getData())) {
                    if (out != null) { out.write(bytes); Toast.makeText(this, "Imagen guardada", Toast.LENGTH_SHORT).show(); }
                } catch (IOException e) { Toast.makeText(this, "No se pudo guardar la imagen", Toast.LENGTH_LONG).show(); }
            }
        }
        if (request == 10 && fileResult != null) {
            fileResult.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data)); fileResult = null;
        }
    }
    @Override protected void onSaveInstanceState(Bundle state) { web.saveState(state); super.onSaveInstanceState(state); }
    @Override public void onBackPressed() { if (web.canGoBack()) web.goBack(); else super.onBackPressed(); }
    @Override protected void onPause() { web.onPause(); CookieManager.getInstance().flush(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }
    @Override protected void onDestroy() { if (fileResult != null) fileResult.onReceiveValue(null); web.destroy(); super.onDestroy(); }
}

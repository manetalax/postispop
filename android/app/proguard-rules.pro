# Keep only methods explicitly exposed to a WebView JavaScript interface.
# R8 may optimize and rename the rest of the app, including internal classes.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
# Retain line information for private release crash diagnostics.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

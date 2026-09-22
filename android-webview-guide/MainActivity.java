package com.smartenglish.sathi;

import android.annotation.SuppressLint;
import android.content.Context;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

/**
 * MainActivity for Interactive Flat Panel (IFP) Android APK WebView
 * Configured with MediaPlaybackRequiresUserGesture(false) and WebChromeClient
 */
public class MainActivity extends AppCompatActivity {

    private WebView webView;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Keep screen on for Interactive Flat Panel classroom teaching
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Request audio focus for IFP speakers
        AudioManager audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (audioManager != null) {
            audioManager.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
        }

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();

        // 1. Critical IFP Audio Setting: allow autoplay without prior touch gesture block
        settings.setMediaPlaybackRequiresUserGesture(false);

        // 2. Enable JavaScript
        settings.setJavaScriptEnabled(true);

        // 3. Storage and DOM caching
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        // 4. Hardware acceleration
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // 5. Provide WebChromeClient for speech and audio media permissions
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                // Grant microphone and audio permission for speech shadowing & speech synthesis
                request.grant(request.getResources());
            }
        });

        webView.setWebViewClient(new WebViewClient());

        // Replace with your production deployment URL or local asset
        String appUrl = "https://ais-dev-egerg6diz6ewi4bpi7ldq4-760418123549.asia-southeast1.run.app";
        webView.loadUrl(appUrl);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}

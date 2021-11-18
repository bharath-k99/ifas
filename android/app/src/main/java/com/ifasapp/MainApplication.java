package com.ifasapp;

import android.app.Application;
// import com.reactlibrary.RNScreenDetectorPackage;

import com.facebook.react.ReactApplication;
//import com.guichaguri.trackplayer.TrackPlayer;
import com.dooboolab.RNAudioRecorderPlayerPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.eko.RNBackgroundDownloaderPackage;
import org.wonday.pdf.RCTPdfView;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.imagepicker.ImagePickerPackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.inprogress.reactnativeyoutube.ReactNativeYouTube;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import io.invertase.firebase.RNFirebasePackage;
import com.brentvatne.react.ReactVideoPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.zmxv.RNSound.RNSoundPackage; // <-- New
import com.rnim.rn.audio.ReactNativeAudioPackage; // <-- New
import com.kishanjvaghela.cardview.RNCardViewPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.dylanvann.fastimage.FastImageViewPackage;

import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
 import java.util.Arrays;
import java.util.List;
import com.ifasapp.MyNativeModules.MyNativeModulePackage;


public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            //new TrackPlayer(),
            new RNAudioRecorderPlayerPackage(),
            new RNCWebViewPackage(),
            new RCTPdfView(),
            new RNFetchBlobPackage(),
            new ImagePickerPackage(),
            new RNScreensPackage(),
            new ReanimatedPackage(),
            new RNGestureHandlerPackage(),
            new ReactNativeYouTube(),
            new NetInfoPackage(),

            new ReactVideoPackage(),
            new SplashScreenReactPackage(),
            new OrientationPackage(),
            // new RNScreenDetectorPackage(),
             new RNFirebasePackage(),
             new RNFirebaseMessagingPackage(),
            new RNFirebaseNotificationsPackage(),
            new MyNativeModulePackage(),
              new RNBackgroundDownloaderPackage(),
              new RNDeviceInfo(),
              new RNSoundPackage(),
              new ReactNativeAudioPackage(),
              new RNCardViewPackage(),
              new PickerPackage(),
              new FastImageViewPackage()
           );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    // getWindow().setFlags(LayoutParams.FLAG_SECURE, LayoutParams.FLAG_SECURE); 

  }
}

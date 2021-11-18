package com.ifasapp;

import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import com.facebook.react.ReactActivity;
import org.devio.rn.splashscreen.SplashScreen;
import com.facebook.react.ReactRootView;
import com.facebook.react.ReactActivityDelegate;
import android.content.Intent; // <--- import 
import android.content.res.Configuration; // <--- import
import android.util.Log;
import android.view.WindowManager;
import com.ifasapp.MyNativeModules.MyNativeModule;
import androidx.annotation.NonNull;

public class MainActivity extends ReactActivity {
    public static String TAG = "MainActivity";
    String file_url = "https://www.youtube.com/get_video_info?video_id=J61XNjDuIg8&el=embedded&ps=default&eurl=&gl=US&hl=en";

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);  // here
        super.onCreate(savedInstanceState);
        // getWindow().setFlags(LayoutParams.FLAG_SECURE, LayoutParams.FLAG_SECURE); 
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
	}

    @Override
    protected String getMainComponentName() {
        return "ifasApp";
    }

    @Override
      public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }
    // @Override
    // public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
    //     super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    //     if(grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED){
    //         Log.v(TAG,"Permission: "+permissions[0]+ "was "+grantResults[0]);
    //         if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.CUPCAKE) {
    //              new MyNativeModule.DownloadFileFromURL().execute(file_url);
    //         }
    //         //resume tasks needing this permission
    //     }
    // }
}

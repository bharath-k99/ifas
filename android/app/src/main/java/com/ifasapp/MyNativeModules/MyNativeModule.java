package com.ifasapp.MyNativeModules;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.ifasapp.MainActivity;

import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Environment;
import android.os.StrictMode;
import android.provider.Settings;
import android.net.Uri;
import android.content.Context;
import android.media.ExifInterface;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import android.telecom.Call;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.ActivityCompat;
import com.facebook.react.bridge.Promise;
import java.io.File;
import java.io.OutputStream;
import java.lang.reflect.Type;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

public class MyNativeModule extends ReactContextBaseJavaModule {

    public static String TAG = "MyNative";
    public static String readResult = null;
    public static boolean isExecuted = false;
    private static ReactApplicationContext reactContext;
    String file_url = null;
    private static Promise mPickerPromise;
    private static Callback globalCallback;
    @Override
    public String getName() {
        /**
         * return the string name of the NativeModule which represents this class in JavaScript
         * In JS access this module through React.NativeModules.OpenSettings
         */
        return "MyNative";
    }

    /*This is for navigating to device settings*/
 @ReactMethod
  public void openNetworkSettings(Callback cb) {
    Activity currentActivity = getCurrentActivity();

    if (currentActivity == null) {
      cb.invoke(false);
      return;
    }

    try {
      currentActivity.startActivity(new Intent(android.provider.Settings.ACTION_SETTINGS));
      cb.invoke(true);
    } catch (Exception e) {
      cb.invoke(e.getMessage());
    }
  }
    /*This is for getting video info*/
    @ReactMethod
    public void getVideoInfo(String videoUrl,Callback cb) {
        file_url = videoUrl;
//         mPickerPromise = promise;
        StrictMode.ThreadPolicy policy = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.GINGERBREAD) {
            policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
            StrictMode.setThreadPolicy(policy);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.CUPCAKE) {
                new DownloadFileFromURL(cb).execute(file_url);
        }
    }

    /* constructor */
    public MyNativeModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    /**
     * Background Async Task to download file
     */
    @SuppressLint("NewApi")
    public static class DownloadFileFromURL extends AsyncTask<String, String, String> {
//        private Callback callback;

       DownloadFileFromURL(Callback callback) {
           globalCallback = callback;
       }

        /**
         * Before starting background thread Show Progress Bar Dialog
         */
        @Override
        protected void onPreExecute() {
            super.onPreExecute();
//            showDialog(progress_bar_type);
        }

        /**
         * Downloading file in background thread
         */
        @Override
        protected String doInBackground(String... f_url) {
            int count;
            try {
                URL url = new URL(f_url[0]);
                URLConnection conection = url.openConnection();
                conection.connect();

                // this will be useful so that you can show a tipical 0-100%
                // progress bar
                int lenghtOfFile = conection.getContentLength();

                // download the file
                InputStream input = new BufferedInputStream(url.openStream(),
                        8192);

                // Output stream
                OutputStream output = new FileOutputStream(Environment
                        .getExternalStorageDirectory().toString()
                        + "/getinfo.txt");

                byte data[] = new byte[1024];

                long total = 0;

                while ((count = input.read(data)) != -1) {
                    total += count;
                    // publishing the progress....
                    // After this onProgressUpdate will be called
                    publishProgress("" + (int) ((total * 100) / lenghtOfFile));

                    // writing data to file
                    output.write(data, 0, count);
                }

                // flushing output
                output.flush();

                // closing streams
                output.close();
                input.close();

                String yourFilePath = Environment
                        .getExternalStorageDirectory().toString()
                        + "/getinfo.txt";
                File yourFile = new File(yourFilePath);
                String resultUrl = readFile(yourFile.getAbsolutePath());
                Log.d(TAG, "CONVERTED HASH resultUrl" + resultUrl);

                return  resultUrl;
            } catch (Exception e) {
                Log.e("Error: ", e.getMessage());
            }

            return null;
        }

        /**
         * Updating progress bar
         */
        protected void onProgressUpdate(String... progress) {
            // setting progress percentage
//            pDialog.setProgress(Integer.parseInt(progress[0]));
        }

        /**
         * After completing background task Dismiss the progress dialog
         **/
        @Override
        protected void onPostExecute(String file_url) {
            // dismiss the dialog after the file was downloaded
//            dismissDialog(progress_bar_type);
            Log.d(TAG, "file_url HASH resultUrl" + file_url);

            if(file_url!=null) {
                Log.d(TAG, "file_url HASH resultUrl not null" + file_url);
               globalCallback.invoke(file_url);
                // mPickerPromise.resolve(file_url);
            }
            else{
                globalCallback.invoke(false);
                // mPickerPromise.reject("", "No value");
            }
        }

    }

    // Read text from file
    public static String readFile(String filePath) {
        //reading text from file
        String finalResult = "";
        StringBuilder sb = new StringBuilder();
        try {
            Log.d(TAG, "filePath " + filePath);
            //  FileInputStream fin = openFileInput(filePath);
            FileInputStream fin = new FileInputStream(new File(filePath));

            int c;
            while ((c = fin.read()) != -1) {
                sb.append(Character.toString((char) c));
            }
            Log.d(TAG, "String" + sb.toString());
            fin.close();

            if (sb.toString().trim().length() > 0) {
                String[] separtedArray = sb.toString().split("&");
                HashMap<String, String> hashArray = new HashMap<>();
                HashMap<String, String> hashQuality = new HashMap<>();

                ArrayList<HashMap<String, String>> arrayHash = new ArrayList<>();

                if (separtedArray.length > 0) {
                    for (int i = 0; i < separtedArray.length; i++) {
                        Log.d(TAG, "Separted And " + separtedArray[i].toString());
                        String[] separtedEqual = separtedArray[i].toString().split("=");
                        Log.d(TAG, "Separted = " + separtedArray[0].toString() + " , " + separtedArray[1].toString());
                        hashArray.put(separtedEqual[0], separtedEqual[1]);
                    }
                }
                if (hashArray.size() > 0) {
                    String keyDecoded = "";
                    Iterator myVeryOwnIterator = hashArray.keySet().iterator();
                    while (myVeryOwnIterator.hasNext()) {
                        String key = (String) myVeryOwnIterator.next();

                        if (key.equalsIgnoreCase("url_encoded_fmt_stream_map")) {
                            String value = (String) hashArray.get(key);
                            keyDecoded = URLDecoder.decode(value, "UTF-8");
                            break;
                        }


                    }
                    Log.d(TAG, "KEY DECODED " + keyDecoded);
                    if (keyDecoded.trim().length() > 0) {
                        String[] streams = keyDecoded.split(",");
                        Log.d(TAG, "KEY DECODED streams " + streams.length);
                        for (int i = 0; i < streams.length; i++) {
                            Log.d(TAG, "streams " + streams[i].toString());
                            hashQuality = new HashMap<>();
                            String[] spiltStream = streams[i].split("&");
                            Log.d(TAG, "KEY DECODED spiltStream " + spiltStream.length);
                            for (int j = 0; j < spiltStream.length; j++) {
                                String[] spiltStreamSecond = spiltStream[j].split("=");
                                Log.d(TAG, "KEY DECODED spiltStreamSecond " + spiltStreamSecond.length);

                                if (spiltStreamSecond[0].equalsIgnoreCase("itag")) {
                                    Log.d(TAG, "KEY DECODED spiltStreamSecond itag " + spiltStreamSecond[0]);

                                    int swtchIndex = Integer.valueOf(spiltStreamSecond[1].toString());
                                    Log.d(TAG, "KEY DECODED spiltStreamSecond swtchIndex " + swtchIndex);

                                    switch (swtchIndex) {
                                        case 18:
                                            Log.d(TAG, "The first letter of the alphabet 18");

                                            hashQuality.put("mimeType", "mp4");
                                            hashQuality.put("width", "640");
                                            hashQuality.put("height", "360");
                                            hashQuality.put("qualityLabel", "360p");

                                            break;
                                        case 22:
                                            Log.d(TAG, "The first letter of the alphabet 22");

                                            hashQuality.put("mimeType", "mp4");
                                            hashQuality.put("width", "1280");
                                            hashQuality.put("height", "720");
                                            hashQuality.put("qualityLabel", "720p");
                                            break;
                                        case 43:
                                            Log.d(TAG, "The first letter of the alphabet 43");

                                            hashQuality.put("mimeType", "webm");
                                            hashQuality.put("width", "640");
                                            hashQuality.put("height", "360");
                                            hashQuality.put("qualityLabel", "360p");
                                            break;

                                    }
                                }
                                String key = spiltStreamSecond[0];
                                String value = URLDecoder.decode(spiltStreamSecond[1], "UTF-8");
                                hashQuality.put(key, value);
                                Log.d(TAG, "KEY DECODED hashQuality KEY " + key);

                            }
                            //Add Hash map to array
                            arrayHash.add(hashQuality);
                            Log.d(TAG, "KEY DECODED arrayHash Length  " + arrayHash.size());

                        }

                    }

                    Gson gson = new Gson();
                    Type type = new TypeToken<ArrayList<HashMap<String, String>>>() {
                    }.getType();
                    Log.d(TAG, "CONVERTED type " + type);
                    String result = gson.toJson(arrayHash, type);
                    isExecuted = true;
                    readResult = result;
                    finalResult = result;
                    Log.d(TAG, "CONVERTED HASH " + result);
                }
                Log.d(TAG, "hashArray " + hashArray.size());
            }


        } catch (IOException e) {
            Log.e("C2c", "Error occured while reading text file!!");

        }
        return finalResult;
    }

    // public boolean isStoragePermissionGranted() {
    //     if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
    //         if (ActivityCompat.checkSelfPermission(reactContext, android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
    //                 == PackageManager.PERMISSION_GRANTED) {
    //             Log.v(TAG, "Permission is granted");
    //             return true;
    //         } else {

    //             Log.v(TAG, "Permission is revoked");
    //             ActivityCompat.requestPermissions(getCurrentActivity(), new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, 1);
    //             return false;
    //         }
    //     } else { //permission is automatically granted on sdk<23 upon installation
    //         Log.v(TAG, "Permission is granted");
    //         return true;
    //     }
    // }

//    @Override
//    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
//        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
//        if(grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED){
//            Log.v(TAG,"Permission: "+permissions[0]+ "was "+grantResults[0]);
//            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.CUPCAKE) {
//                new DownloadFileFromURL().execute(file_url);
//            }
//            //resume tasks needing this permission
//        }
//    }

}
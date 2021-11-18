# Eureka
 
##### DEV:  Mahipal Singh


#### REACT NATIVE


NEED TO UNCOMMENT WHEN APPLICATION LIVE
VIDEO_PLAYER.JS
LINE NUMBER:1181 176


```
 react-native-cli: 2.0.1
 react-native: 0.60.5
```

```

Install the node module for existing project
supportive link: https://facebook.github.io/react-native/docs/getting-started

RUN dev Enviornment
##### Android
Note: also check `adb devices' to verify the android device connected or not.
```sh
$ cd Eureka
$  react-native run-android
```
   

##### Review Test Case : https://docs.google.com/spreadsheets/d/1rnXParcUN4dpBxGXtuEHlPSD-Rn8Peqa/edit#gid=1587486991

##### Account Details : 
 
me.choudhary@gmail.com
Chou7ary*

https://play.google.com/apps/publish/?account=5126849707875044100

CREDENTIALS:
me.choudhary@gmail.com
chou7ary


#####  Bundle Identifier:
 com.ifasapp


##### Firebase account:
cgtpuneet@gmail.com
 Puneet@23

Please add your email as developer for crash reports


##### Android 
 
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=chou7ary
MYAPP_RELEASE_KEY_PASSWORD=chou7ary


What is your first and last name?
  [Unknown]:  IFAS
What is the name of your organizational unit?
  [Unknown]:  IFAS
What is the name of your organization?
  [Unknown]:  IFAS
What is the name of your City or Locality?
  [Unknown]:  PUNE
What is the name of your State or Province?
  [Unknown]:  MAHARASHTRA
What is the two-letter country code for this unit?
  [Unknown]:  IN
Is CN=IFAS, OU=IFAS, O=IFAS, L=PUNE, ST=MAHARASHTRA, C=IN correct?
  [no]:  YES


App Key-store and Certificates are attached. 


#####  Git
git@github.com:CGTechnosoftdev/ifas 
##### branch
 ifasReactNative

##### android command

react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

##### ios command

react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios






//Plist

<key>LSApplicationQueriesSchemes</key>
	<array>
		<string>dbapi-1</string>
		<string>dbapi-3</string>
		<string>dbapi-8-emm</string>
		<string>dbapi-2</string>
	</array>
	<key>CFBundleURLTypes</key>
	<array>
		<dict>
			<key>CFBundleTypeRole</key>
			<string>Editor</string>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>https://meet.ifasonline.com</string>
			</array>
		</dict>
		<dict/>
	</array>
//
//  Detector.h
//  DetectScreenRecorder
//
//  Created by Vandana on 14/02/19.
//  Copyright © 2019 Mahipal Singh. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>
#import <React/RCTEventEmitter.h>

NS_ASSUME_NONNULL_BEGIN

extern NSString *kScreenRecordingDetectorRecordingStatusChangedNotification;

@interface Detector : NSObject

+(instancetype)sharedInstance;
 
- (BOOL)isRecording;
- (void)checkCurrentRecordingStatus;
- (void)triggerDetectorTimer;
@end

@interface ScreenRecorderDetect : RCTEventEmitter <RCTBridgeModule>
- (void)capturedChange ;
-(void) isScreenCaptureEnabled:(BOOL)isCaptured;

@end
NS_ASSUME_NONNULL_END

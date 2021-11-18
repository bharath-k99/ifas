//
//  Detector.m
//  DetectScreenRecorder
//
//  Created by Vandana on 14/02/19.
//  Copyright © 2019 Mahipal Singh. All rights reserved.
//

#import "Detector.h"
#import <UIKit/UIKit.h>
#if __has_include(<React/RCTBridgeModule.h>)
  #import <React/RCTBridgeModule.h>
#else
  #import "RCTBridgeModule.h"
#endif
float const kScreenRecordingDetectorTimerInterval = 1.0;
NSString *kScreenRecordingDetectorRecordingStatusChangedNotification = @"kScreenRecordingDetectorRecordingStatusChangedNotification";

@interface Detector()

@property BOOL lastRecordingState;
 


@end
@implementation Detector

RCT_EXPORT_MODULE()

+ (instancetype)sharedInstance {
    static Detector *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}
- (id)init {
    if (self = [super init]) {
        // do some init stuff here..
        self.lastRecordingState = NO; // initially the recording state is 'NO'. This is the default state.
    }
    return self;
}
  RCT_EXPORT_METHOD(isRecording:(NSDictionary *)options
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject) {
    
    for (UIScreen *screen in UIScreen.screens) {
        if ([screen respondsToSelector:@selector(isCaptured)]) {
            // iOS 11+ has isCaptured method.
            if ([screen performSelector:@selector(isCaptured)]) {
                // screen capture is active
               return resolve(@(YES));
            } else if (screen.mirroredScreen) {
                return resolve(@(YES)); // mirroring is active
            }
        } else {
            // iOS version below 11.0
            if (screen.mirroredScreen)
                return resolve(@(YES));
        }
    }
    return resolve(@(NO));
    
}


-(void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context
{
    if([keyPath isEqualToString:@"captured"]){
        [self checkCurrentRecordingStatus];
    }
}


  RCT_EXPORT_METHOD(checkCurrentRecordingStatus:(NSDictionary *)options
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject) {
    
    BOOL isRecording = [self isRecording];
//    if (isRecording != self.lastRecordingState) {
        NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
      NSMutableDictionary *dic = [[NSMutableDictionary alloc] init];
      [dic setValue:[NSNumber numberWithBool:isRecording] forKey:@"isRecording"];
      [center postNotificationName: kScreenRecordingDetectorRecordingStatusChangedNotification object:dic];
//    }
    self.lastRecordingState = isRecording;
    return resolve(@(isRecording));
}
 
@end

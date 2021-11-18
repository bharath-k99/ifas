//
//  Detector.m
//  DetectScreenRecorder
//
//  Created by Vandana on 14/02/19.
//  Copyright © 2019 Mahipal Singh. All rights reserved.
//

#import "Detector.h"
#import <UIKit/UIKit.h>
float const kScreenRecordingDetectorTimerInterval = 1.0;
NSString *kScreenRecordingDetectorRecordingStatusChangedNotification = @"kScreenRecordingDetectorRecordingStatusChangedNotification";

@interface Detector()

@property BOOL lastRecordingState;
 


@end
@implementation Detector


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
- (BOOL)isRecording {
    for (UIScreen *screen in UIScreen.screens) {
        if ([screen respondsToSelector:@selector(isCaptured)]) {
            // iOS 11+ has isCaptured method.
            if ([screen performSelector:@selector(isCaptured)]) {
                return YES; // screen capture is active
            } else if (screen.mirroredScreen) {
                return YES; // mirroring is active
            }
        } else {
            // iOS version below 11.0
            if (screen.mirroredScreen)
                return YES;
        }
    }
    return NO;
}


-(void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context
{
    if([keyPath isEqualToString:@"captured"]){
        [self checkCurrentRecordingStatus];
    }
}


- (void)checkCurrentRecordingStatus {
    BOOL isRecording = [self isRecording];
//    if (isRecording != self.lastRecordingState) {
        NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
      NSMutableDictionary *dic = [[NSMutableDictionary alloc] init];
      [dic setValue:[NSNumber numberWithBool:isRecording] forKey:@"isRecording"];
      [center postNotificationName: kScreenRecordingDetectorRecordingStatusChangedNotification object:dic];
//    }
    self.lastRecordingState = isRecording;
}
 
@end

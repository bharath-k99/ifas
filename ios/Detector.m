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
 @property NSTimer *timer;


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
      NSLog(@"Screen Capture is Enabled");
      RCTLog(@"Screen Capture is Enabled");
      if (@available(iOS 11.0, *)) {
        ScreenRecorderDetect *manager = [ScreenRecorderDetect allocWithZone: nil];
        [manager isScreenCaptureEnabled:UIScreen.mainScreen.isCaptured];
      }
    }
  
}


//- (void)checkCurrentRecordingStatus {
//    BOOL isRecording = [self isRecording];
////    if (isRecording != self.lastRecordingState) {
//        NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
//      NSMutableDictionary *dic = [[NSMutableDictionary alloc] init];
//      [dic setValue:[NSNumber numberWithBool:isRecording] forKey:@"isRecording"];
//      [center postNotificationName: kScreenRecordingDetectorRecordingStatusChangedNotification object:dic];
////    }
//    self.lastRecordingState = isRecording;
//}
 
- (void)triggerDetectorTimer {
  
  Detector *detector = [Detector sharedInstance];
  if (detector.timer) {
    [self stopDetectorTimer];
  }
  detector.timer = [NSTimer scheduledTimerWithTimeInterval:kScreenRecordingDetectorTimerInterval
                                                    target:detector
                                                  selector:@selector(checkCurrentRecordingStatus)
                                                  userInfo:nil
                                                   repeats:YES];
}
- (void)checkCurrentRecordingStatus {
  BOOL isRecording = [self isRecording];
  NSLog(@"Current Status:%d",isRecording);

  if (isRecording != self.lastRecordingState) {
    NSLog(@"Current Status:%d",isRecording);
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    [center postNotificationName: kScreenRecordingDetectorRecordingStatusChangedNotification object:nil];
  }
  self.lastRecordingState = isRecording;
}
- (void)stopDetectorTimer {
  Detector *detector = [Detector sharedInstance];
  if (detector.timer) {
    [detector.timer invalidate];
    detector.timer = NULL;
  }
}


@end

@implementation ScreenRecorderDetect
+ (id)allocWithZone:(NSZone *)zone {
  static ScreenRecorderDetect *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}
RCT_EXPORT_MODULE();
// We can send back a promise to our JavaScript environment :)
RCT_REMAP_METHOD(get,
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString* recordOK = @"YES";
  NSString* pasDerecordOK = @"NO";
  
  if ([[Detector sharedInstance] isRecording]) {
    resolve(recordOK);
  } else {
    resolve(pasDerecordOK);
  }
  
}



- (void)capturedChange {
    if (@available(iOS 11.0, *)) {
    NSLog(@"Recording Status: %s", [UIScreen mainScreen].isCaptured ? "true" : "false");
        //do something
    }
}
-(void)addObv{
  if (@available(iOS 11.0, *)) {
    [[NSNotificationCenter defaultCenter] addObserver:self
                      selector:@selector(capturedChange)
     name:UIScreenCapturedDidChangeNotification object:nil];
  }
}
RCT_EXPORT_METHOD(addScreenRecorderListner)
{
 // [[Detector sharedInstance] triggerDetectorTimer];
//  [self addObv];
  RCTLogInfo(@"Listner Registered");
    UIScreen *mainScreen = [UIScreen mainScreen];
    [mainScreen addObserver: Detector.sharedInstance forKeyPath:@"captured" options:NSKeyValueObservingOptionNew | NSKeyValueObservingOptionOld context:NULL];
}
RCT_EXPORT_METHOD(addEvent:(NSString *)name)
{
  RCTLogInfo(@"Pretending to create an event %@", name);
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
           @"isScreenCaptureEnabled"];
}

-(void) isScreenCaptureEnabled:(BOOL)isCaptured {
  [self sendEventWithName:@"isScreenCaptureEnabled" body:@{@"value": @(isCaptured)}];
}
Detector *screenRecordingDetector(void);

@end

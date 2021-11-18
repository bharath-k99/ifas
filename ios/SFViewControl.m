#import "SFViewControl.h"
#import "AppDelegate.h"
#import "Orientation.h"

@implementation SFViewControl

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
  return @[
           @"isClose"];
}
- (void)safariViewControllerDidFinish:(SFSafariViewController *)controller {
     [self restrictRotation:YES];
         [self sendEventWithName:@"isClose" body:@{@"value": @(true)}];
  [self.bridge.eventDispatcher sendAppEventWithName:@"SFSafariViewControllerDismissed" body:nil];
}

RCT_EXPORT_METHOD(rotatePlayerLockUnlock:(NSString *)urlString) {
  NSLog(@"Your Unlock Method %@", urlString);
  if([urlString isEqualToString:@"unloack"]){
[self restrictRotation:NO];
  }else if([urlString isEqualToString:@"potrate"]){
     NSLog(@"Your Potrate Method %@", urlString);
    [self restrictRotation:YES];
  }
}

//RCT_EXPORT_METHOD(rotateVideoPlayerPotrate:(NSString *)urlString params:(NSDictionary *)params) {
//
////  dispatch_async(dispatch_get_main_queue(), ^{});
//  NSLog(@"Your Potrate Method %@", urlString);
// [self restrictRotation:YES];
//}

RCT_EXPORT_METHOD(closeURL:(NSString *)urlString params:(NSDictionary *)params) {
  dispatch_async(dispatch_get_main_queue(), ^{
     [self restrictRotation:YES];
    UIViewController *rootViewController = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    [rootViewController dismissViewControllerAnimated:YES completion:nil];
  });
}
RCT_EXPORT_METHOD(openURL:(NSString *)urlString params:(NSDictionary *)params) {
  [self restrictRotation:NO];
  NSURL *url = [[NSURL alloc] initWithString:urlString];

  UIViewController *rootViewController = [[[UIApplication sharedApplication] delegate] window].rootViewController;
  while(rootViewController.presentedViewController) {
    rootViewController = rootViewController.presentedViewController;
  }

  SFSafariViewController *safariViewController = [[SFSafariViewController alloc] initWithURL:url];
  UINavigationController *navigationController = [[UINavigationController alloc] initWithRootViewController:safariViewController];

  [navigationController setNavigationBarHidden:YES animated:NO];
  safariViewController.delegate = self;

  if ([params objectForKey:@"tintColor"]) {
    UIColor *tintColor = [RCTConvert UIColor:params[@"tintColor"]];

    if([safariViewController respondsToSelector:@selector(setPreferredControlTintColor:)]) {
      safariViewController.preferredControlTintColor = tintColor;
    } else {
      safariViewController.view.tintColor = tintColor;
    }
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    [rootViewController presentViewController:navigationController animated:YES completion:^{
      [self.bridge.eventDispatcher sendDeviceEventWithName:@"SFSafariViewControllerDidLoad" body:nil];
    }];
  });
}

/*! @abstract Called when the browser is redirected to another URL while loading the initial page.
    @param URL The new URL to which the browser was redirected.
    @discussion This method may be called even after -safariViewController:didCompleteInitialLoad: if
    the web page performs additional redirects without user interaction.
 */
- (void)safariViewController:(SFSafariViewController *)controller initialLoadDidRedirectToURL:(NSURL *)URL{
  NSLog(@"Your URL is %@", URL);
}
//- (void)safariViewController:(SFSafariViewController *)controller activityItemsForURL:(NSURL *)URL title:(nullable NSString *)title{
//    NSLog(@"Your URL is2 %@", title);
//}
RCT_EXPORT_METHOD(close) {
    dispatch_async(dispatch_get_main_queue(), ^{
       [self restrictRotation:YES];
      UIViewController *rootViewController = [[[UIApplication sharedApplication] delegate] window].rootViewController;
      [rootViewController dismissViewControllerAnimated:YES completion:nil];
    });
}

-(void) restrictRotation:(BOOL) restriction
{
    AppDelegate* appDelegate = (AppDelegate*)[UIApplication sharedApplication].delegate;
    appDelegate.restrictRotation = restriction;
}

@end


import { StackActions, NavigationActions } from 'react-navigation'

export const goToWhichScreen = (screenName, screenProps) => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: screenName })],
    });
    screenProps.navigation.dispatch(resetAction);
  }
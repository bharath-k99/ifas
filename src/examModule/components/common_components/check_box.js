import React, { Component } from 'react';
import {
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Enum
import { checkBoxStyleColor } from '../../enums/global_colors';

// StyleSheet
import { check_style } from './style_common';

// Summary: This class will provide the functionality for checkbox.
export default class CheckBox extends Component {
    
    constructor(props) {
        super(props);
    }
    
    // Summary: checkClicked function will handle the click event. 
    checkClicked = async () => {
        // setState is async function.
        // Call function type prop with return values.
        this.props.clicked(this.props.value, !(this.props.selected));
    }
    
    render() {
      return (
        <View style={{ flexDirection : 'row' }}>
            <TouchableOpacity onPress={this.checkClicked} style={this.props.style}>
                <View style={ check_style.containerMain }>
                    <View style={[
                        check_style.containerSub,
                        {
                        backgroundColor: this.props.selected ? checkBoxStyleColor.backgroudColourSelected : checkBoxStyleColor.backgroudColourNotSelected,
                    }]}/>
                </View>
            </TouchableOpacity>
            <View style = { check_style.textInContainer }>
                <Text>
                    { this.props.value }
                </Text>
            </View>
        </View>
      )
    }
  }
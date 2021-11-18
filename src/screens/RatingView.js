// Summary: This file is Loader Component which can be used in all modules.
// Created: 11/10/2019 12:00 PM - VS (IN)
import React, { Component } from 'react';
import {
  View,
  Modal,
  ActivityIndicator,
  Image,
  TextInput,
  Text,
  TouchableOpacity
} from 'react-native';
import { constantStrings,textInputPlaceholders } from '../resources/constants.js'
import dimensions from '../resources/dimension';

// Style sheet
import LoaderStyles from './loader/style-loader'
import RatingStyles from '../styles/RatingViewStyle'
export default class AddNewMessage extends Component {
  constructor(props) {
    super(props);
    console.log('props',props)
    this.state = {
      messageTyped: '',
      opacityArray: [0.4, 0.4, 0.4, 0.4, 0.4],
      selRating: 0
    }
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('prevProps', prevProps, prevState)
    console.log('currProps', this.props)

    // if (this.props.updateProps == true) {
    //   this.props.updateProps = false
    //   this.setState({
    //     opacityArray: [0.4, 0.4, 0.4, 0.4, 0.4]
    //   })
    //   console.log('this.state.opArray unmount', this.state.opacityArray)
    // }
    
  }
  render() {
    console.log('this.state.opArray',this.state)
    return (
      <Modal
        transparent={true}
        animationType={'none'}
        visible={this.props.feedback}
      // onRequestClose={() => { console.log('back action tapped') }}
      >
        <TouchableOpacity 
        style={RatingStyles.modalBackground} 
        onPress={() => {
          this.props.dismissRatingDialog()
        //   this.props.selectOption(this.props.selThreadId, 0, ''), 
        //   this.setState({
        //     opacityArray: [0.4, 0.4, 0.4, 0.4, 0.4],
        //     messageTyped: ''
        // }) 
        }}>
          <View style={RatingStyles.ratingViewWrapper}>
            <View style={RatingStyles.ratingInnerView}>
              <TouchableOpacity style={RatingStyles.smileyBackground} onPress={() => {
              // selRating = 1, 
              this.setState({
                opacityArray: [1.0, 0.4, 0.4, 0.4, 0.4],
                selRating:1
              })}}>
                <Image style={[RatingStyles.smileyView, { opacity: this.state.opacityArray[0] }]}
                  source={require('../images/Worst.png')}
                  opacity={this.state.opacityArray[0]}
              />
              </TouchableOpacity>
              <TouchableOpacity style={RatingStyles.smileyBackground} onPress={() => {
              //selRating = 2, 
              this.setState({
                opacityArray: [0.4, 1.0, 0.4, 0.4, 0.4],
                selRating:2
              }) }}>
                <Image style={[RatingStyles.smileyView, { opacity: this.state.opacityArray[1] }]}
                  source={require('../images/Poor.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity style={RatingStyles.smileyBackground} onPress={() => {
              //selRating = 3,
              this.setState({
                opacityArray: [0.4, 0.4, 1.0, 0.4, 0.4],
                selRating:3
              }) }}>
                <Image style={[RatingStyles.smileyView, { opacity: this.state.opacityArray[2] }]}
                  source={require('../images/Average.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity style={RatingStyles.smileyBackground} onPress={() => {
              //selRating = 4, 
              this.setState({
                opacityArray: [0.4, 0.4, 0.4, 1.0, 0.4],
                selRating:4
              }) }}>
                <Image style={[RatingStyles.smileyView, { opacity: this.state.opacityArray[3] }]}
                  source={require('../images/Good.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity style={RatingStyles.smileyBackground} onPress={() => {
              //selRating = 5, 
              this.setState({
                opacityArray: [0.4, 0.4, 0.4, 0.4, 1.0],
                selRating:5
              }) }}>
                <Image style={[RatingStyles.smileyView, { opacity: this.state.opacityArray[4] }]}
                  source={require('../images/Excellent.png')}
                />
              </TouchableOpacity>
            </View>
            <TextInput
              style={RatingStyles.TextInputStyle}
              placeholder={textInputPlaceholders.review}
              multiline={true}
              onChangeText={(text) => { this.setState({ messageTyped: text }) }}
              value={this.state.messageTyped}
            />
            <TouchableOpacity
              style={RatingStyles.SubmitButton}
              onPress={() => {
                console.warn('selThreadId', this.state.messageTyped, this.state.selRating, this.props.selThreadId)
                this.props.selectOption(this.props.selThreadId, this.state.selRating, this.state.messageTyped, this.props.updateProps),
                  this.setState({
                    opacityArray: [0.4, 0.4, 0.4, 0.4, 0.4],
                    messageTyped: '',
                    selRating:0
                  })
              }}
              underlayColor='#ffffff'>
              <Text style={RatingStyles.SubmitText}>{constantStrings.submitReview}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }
 
}

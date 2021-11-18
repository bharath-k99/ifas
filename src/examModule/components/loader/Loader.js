// Summary: This file is Loader Component which can be used in all modules.
// Created: 11/10/2019 12:00 PM - VS (IN)
import React, { Component } from 'react';
import {
  View,
  Modal,
  ActivityIndicator
} from 'react-native';

// Style sheet
import  LoaderStyles  from './style-loader'

const Loader = props => {
  const {
    loading,
    ...attributes
  } = props;

  return (
    <Modal
      transparent={true}
      animationType={'none'}
      visible={loading}
      onRequestClose={() => {
        console.log('close modal')
      }}>
      <View style={LoaderStyles.modalBackground}>
        <View style={LoaderStyles.activityIndicatorWrapper}>
          <ActivityIndicator
            animating={loading} />
        </View>
      </View>
    </Modal>
  )
}

export default Loader;

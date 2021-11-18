/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform, AsyncStorage, Text, TextInput, View, Image, TouchableOpacity, FlatList, BackHandler, Modal, ActivityIndicator, StatusBar, Dimensions,
    NativeEventEmitter, NativeModules
} from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import styles from '../styles/subject_style.js';
import ProfileHeaderButton from '../headers/ProfileHeaderButton'
import BackTopicsButton from '../headers/BackTopicsButton'
import CONSTANTS from '../resources/constants';

//Using this for handle start conference
import { EventRegister } from 'react-native-event-listeners';
import * as GoToScreen from '../resources/goToScreen'

//Library
import PDFViewer from 'react-native-pdf'
import { Dialog } from 'react-native-simple-dialogs';
import Orientation from 'react-native-orientation';
import Toast from 'react-native-tiny-toast';

import MockData from '../MockData/mockdata'
import { showNativeAlert } from '../resources/app_utility.js'

import IoniconsMore from 'react-native-vector-icons/Ionicons';
const moreICon = <IoniconsMore name="md-more" size={26} color={colors.white} />;

let currentPageForUpdate = 0;
export default class PDFViewerScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            numberOfPages: 0,
            pagNextPrevious: 0,
            visibleButton: false,
            showingCurrentPage: '0 / 0',
            pageNextForButtonPrevious: 1,
            showMenu: false,
            menuTopicArray: ['Move to First Page', 'Move to Last Page', 'Go to Page'],
            MoveFirstPage: 1,
            MoveLastPage: 0,
            GoToPage: 0,
            dialogVisible: false,
            headingName: undefined,
            pdfForView: undefined,
            isMoreIconVisible: false,
            pageInputMaxLenght: 3,
            isRecording: false,
        };
    }

    showProfile() {
        this.setState({
            showMenu: true
        })
    }
    handleBackButtonClick = () => {
        global.isChatLiveSessionVisible = true;
        this.props.navigation.goBack();
        NativeModules.SFViewControl.rotatePlayerLockUnlock('potrate')
        Orientation.lockToPortrait();
        return true;
    }

    componentDidMount() {
        global.isLiveConfRunningIosForLiveSessionNotHide = true;
        global.isChatLiveSessionVisible = false;
        let screenName = this.props.navigation.state.params.screen_name;
        if (screenName != undefined && screenName == 'subject') {
            this.setState({
                headingName: this.props.navigation.state.params.selected_item.subject_name,
                pdfForView: this.props.navigation.state.params.selected_item.ebook
            }, () => {
                //console.warn('FOUNDED PDF VIEW'+this.state.pdfForView)
            })
        } else if (screenName != undefined && screenName == 'topic') {
            if(this.props.navigation.state.params.selected_ebook_type == 'view'){
                this.setState({
                    headingName: this.props.navigation.state.params.selected_item.TITLE,
                    pdfForView: this.props.navigation.state.params.selected_item.EBOOK_URL
                })
            }else{
                this.setState({
                    headingName: this.props.navigation.state.params.selected_item.TITLE,
                    pdfForView: this.props.navigation.state.params.selected_item.EBOOK_URL1
                })
            }
            // this.setState({
            //     headingName: this.props.navigation.state.params.selected_item.TITLE,
            //     pdfForView: this.props.navigation.state.params.selected_item.EBOOK_URL
            // })
        }else if (screenName != undefined && screenName == 'paidEbookTopic') {
            this.setState({
                headingName: this.props.navigation.state.params.selected_item.topic_name,
                pdfForView: this.props.navigation.state.params.selected_item.t_ebook_url
            })
        } else {
            this.setState({
                headingName: 'PDF Viewer'
            })
        }
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        NativeModules.SFViewControl.rotatePlayerLockUnlock('unloack')
        Orientation.unlockAllOrientations();
        global.navigation = this.props.navigation
        this.props.navigation.setParams({ showProfile: this.showProfile.bind(this) });

        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }

        //Check start live conf notification or screen currently visible or not
        this.listener = EventRegister.addEventListener('start_live_conf_on_notification', (data) => {
            console.log('start_live_conf_on_notification getAccessToken ')
            GoToScreen.goToWhichScreen('Sessions', this.props)
        })
    }

    addListener = () => {
        console.warn('CAPTURE_SESSIONS') 
        let bridge = new NativeEventEmitter(NativeModules.ScreenRecorderDetect);

        this.screenCaptureEnabled = bridge.addListener("isScreenCaptureEnabled", (res) => {
            console.warn('CAPTURE_SESSIONS1' + '\n\n' + JSON.stringify(res))
            if (res.value == true) {
                console.warn('CAPTURE_SESSIONS2' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                this.setState({
                    isRecording: true
                })
            }
            else {
                this.setState({ isRecording: false }, () => {
                    console.warn('CAPTURE_SESSIONS3' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                })
            }

        })
    }

    componentWillUnmount() {
        //console.log("Unmounted Topics")
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        EventRegister.removeEventListener(this.listener);
        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
    }

    moveNext = () => {
        if (this.state.pageNextForButtonPrevious < this.state.numberOfPages) {
            this.setState({
                pagNextPrevious: this.state.pageNextForButtonPrevious + 1,
                showingCurrentPage: this.state.pageNextForButtonPrevious + 1 + '/' + this.state.numberOfPages
            })
        }
    }
    movePrevious = () => {
        if (this.state.pageNextForButtonPrevious > 1) {
            this.setState({
                pagNextPrevious: this.state.pageNextForButtonPrevious - 1,
                showingCurrentPage: this.state.pageNextForButtonPrevious - 1 + '/' + this.state.numberOfPages
            })
        }
    }

    menuItemPress = (item) => {

        if (item == 'Move to First Page') {

            this.setState({
                showMenu: false,
                pagNextPrevious: this.state.MoveFirstPage + 1
            }, () => {
                this.setState({
                    pagNextPrevious: this.state.MoveFirstPage
                })
            })
        } else if (item == 'Move to Last Page') {

            this.setState({
                showMenu: false,
                pagNextPrevious: this.state.MoveLastPage - 1
            }, () => {
                this.setState({
                    pagNextPrevious: this.state.MoveLastPage
                })
            })

        } else if (item == 'Go to Page') {

            this.setState({
                //pagNextPrevious: this.state.GoToPage,
                dialogVisible: true,
                showMenu: false,

            })

        } else if (item == 'Horizontal') {

        }
    }

    render() {
        //'http://54.241.143.180/qa/uploads/events/1.pdf'
        //const source = { uri: 'http://54.241.143.180/qa/uploads/events/1.pdf', cache: true };
        const source = { uri: this.state.pdfForView, cache: true };

        if (this.state.isRecording) {
            return (
                <View style={{ flex: 1, backgroundColor: colors.sessions_bgtheme }}>

                    <View
                        style={{
                            flexDirection: 'row',
                            width: '100%',
                            height: Platform.OS == 'android' ? dimensions.sizeRatio * 55 : dimensions.sizeRatio * 65,
                            backgroundColor: colors.theme,
                            justifyContent: 'space-between',
                            alignItems: Platform.OS == 'android' ? 'center' : 'flex-end',
                        }}>
                        {/* Left back icon */}
                        <TouchableOpacity
                            //hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }} 
                            onPress={() => {
                                this.handleBackButtonClick()
                            }}
                            style={{
                                width: dimensions.sizeRatio * 45,
                                height: dimensions.sizeRatio * 35,
                                marginLeft: Platform.OS == 'android' ? dimensions.sizeRatio * 10 : dimensions.sizeRatio * 5,
                                zIndex: 1,
                                padding: dimensions.sizeRatio * 2,
                                marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 10 : 0
                            }}>
                            <Image
                                source={Platform.OS == 'ios' ? require('../images/back.png') : require('../images/back_two.png')}
                                style={{
                                    width: Platform.OS == 'android' ? dimensions.sizeRatio * 45 : dimensions.sizeRatio * 25,
                                    height: Platform.OS == 'android' ? dimensions.sizeRatio * 35 : dimensions.sizeRatio * 20,
                                    tintColor: colors.white,
                                    //padding: 5
                                }}
                                resizeMode={'contain'}
                            />
                        </TouchableOpacity>
                        {/* Center Heading and page count */}
                        <View
                            style={{
                                width: '100%',
                                flexDirection: 'column',
                                position: 'absolute',
                                center: 0,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 10 : 0
                            }}>
                            <Text style={{
                                fontFamily: CONSTANTS.DEMI,
                                fontSize: dimensions.sizeRatio * 16,
                                color: colors.white,
                                fontFamily: CONSTANTS.DEMI,
                            }}>{this.state.headingName != undefined &&
                                ((this.state.headingName).length > 30) ?
                                (((this.state.headingName).substring(0, 30 - 3)) + '...') :
                                this.state.headingName
                                }
                            </Text>
                            <View
                                style={{

                                }}>
                                <Text
                                    style={{ color: colors.white, fontWeight: 'bold' }}>{this.state.showingCurrentPage}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                        <ActivityIndicator />

                        <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 15), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                            ⚠️ Video Recording not allowed!! ⚠️
                        </Text>
                    </View>
                </View>
            )
        } else {
            return (
                <View style={{ flex: 1, backgroundColor: colors.sessions_bgtheme }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            width: '100%',
                            height: Platform.OS == 'android' ? dimensions.sizeRatio * 55 : dimensions.sizeRatio * 55,
                            backgroundColor: colors.theme,
                            justifyContent: 'space-between',
                            alignItems: Platform.OS == 'android' ? 'center' : 'flex-end',
                        }}>
                        {/* Left back icon */}
                        <TouchableOpacity
                            //hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }} 
                            onPress={() => {
                                this.handleBackButtonClick()
                            }}
                            style={{
                                width: dimensions.sizeRatio * 42,
                                height: dimensions.sizeRatio * 32,
                                marginLeft: Platform.OS == 'android' ? dimensions.sizeRatio * 10 : dimensions.sizeRatio * 5,
                                zIndex: 1,
                                padding: dimensions.sizeRatio * 2,
                                marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 10 : 0
                            }}>
                            <Image
                                source={Platform.OS == 'ios' ? require('../images/back.png') : require('../images/back_two.png')}
                                style={{
                                    width: Platform.OS == 'android' ? dimensions.sizeRatio * 42 : dimensions.sizeRatio * 25,
                                    height: Platform.OS == 'android' ? dimensions.sizeRatio * 32 : dimensions.sizeRatio * 20,
                                    tintColor: colors.white
                                    //padding: 5
                                }}
                                resizeMode={'contain'}
                            />
                        </TouchableOpacity>
                        {/* Center Heading and page count */}
                        <View
                            style={{
                                width: '100%',
                                flexDirection: 'column',
                                position: 'absolute',
                                center: 0,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 10 : 0
                            }}>
                            <Text style={{
                                fontFamily: CONSTANTS.DEMI,
                                fontSize: dimensions.sizeRatio * 16,
                                color: colors.white,
                                fontFamily: CONSTANTS.DEMI,
                            }}>{this.state.headingName != undefined &&
                                ((this.state.headingName).length > 30) ?
                                (((this.state.headingName).substring(0, 30 - 3)) + '...') :
                                this.state.headingName
                                }
                            </Text>
                            <View
                                style={{

                                }}>
                                <Text
                                    style={{ color: colors.white, fontWeight: 'bold' }}>{this.state.showingCurrentPage}</Text>
                            </View>
                        </View>
                        {/* Right more icon */}
                        {this.state.isMoreIconVisible &&
                            <TouchableOpacity
                                activeOpacity={.9}
                                style={{
                                    marginRight: dimensions.sizeRatio * 20,
                                    marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 10 : 0,
                                    alignSelf:'center',
                                    marginTop:5
                                }}
                                hitSlop={{
                                    //top: 20,
                                    //bottom: 20,
                                    left: 30,
                                    right: 30
                                }} onPress={() => {
                                    this.setState({
                                        showMenu: true
                                    })
                                }}>
                                {moreICon}
                                {/* <Image
                            source={require('../images/profile_small.png')}
                            style={{
                                width: dimensions.sizeRatio * 15, height: dimensions.sizeRatio * 17, marginRight: dimensions.sizeRatio * 20
                            }}
                            resizeMode={'contain'}
                        /> */}
                            </TouchableOpacity>}
                    </View>
                    <PDFViewer
                        ref={'padViewer'}
                        source={source}
                        maxScale={3.0}
                        fitWidth={true}
                        enablePaging={true}
                        enableAnnotationRendering={true}
                        activityIndicatorProps={{ color: '#ff9c9c', progressTintColor: '#ff2800' }}
                        horizontal
                        page={this.state.pagNextPrevious}
                        onLoadComplete={(numberOfPages, filePath) => {
                            this.setState({
                                numberOfPages: numberOfPages,
                                visibleButton: true,
                                MoveLastPage: numberOfPages,
                                isMoreIconVisible: true,
                                pageInputMaxLenght: numberOfPages.length
                            })
                            console.log(`number of pages: ${numberOfPages}`);
                        }}
                        onPageChanged={(page, numberOfPages) => {
                            console.log(`current page: ${page}`);
                            this.setState({
                                currentPageForUpdate: page,
                                pageNextForButtonPrevious: page,
                                showingCurrentPage: page + '/' + this.state.numberOfPages
                            })
                        }}
                        onError={(error) => {
                            console.log(error);
                        }}
                        onPressLink={(uri) => {
                            console.log(`Link presse: ${uri}`)
                        }}
                        onScaleChanged={(scale) => {
                            console.log(`Scale change: ${scale}`)
                        }}
                        onPageSingleTap={(page) => {
                            console.log(`Page Single tap: ${page}`)
                        }}
                        onLoadProgress={(percent) => {
                            console.log(`Load progess: ${JSON.stringify(percent)}`)
                        }}
                        style={{
                            flex: 1,
                            width: '100%',
                            height: Dimensions.get('window').height,
                            backgroundColor: 'white'
                        }}
                    />

                    {
                        //"Go to Page..."
                        <Dialog
                            visible={this.state.dialogVisible}
                            title={null}
                            contentStyle={{ padding: 0, backgroundColor: colors.white }}
                            dialogStyle={{ padding: 0, backgroundColor: colors.white }}
                            onTouchOutside={() => this.setState({ dialogVisible: false })} >
                            <View
                                style={{
                                    width: '100%',
                                    height: 150,
                                    backgroundColor: colors.white
                                }}>
                                <View style={{
                                    flex: 1,
                                    alignItems: 'flex-start',
                                    marginHorizontal: 10,
                                }}>
                                    <Text style={{
                                        fontFamily: CONSTANTS.DEMI,
                                        fontSize: dimensions.sizeRatio * 16,
                                        color: colors.theme,
                                        fontFamily: CONSTANTS.DEMI,
                                    }}>
                                        {'Go to Page...'}
                                    </Text>
                                    <TextInput
                                        style={{
                                            marginTop: 10,
                                            color: colors.black,
                                            fontSize: 14,
                                            fontWeight: '300',
                                            backgroundColor: '#f1f1f1',
                                            width: '100%',
                                            padding: 10
                                        }}
                                        autoFocus={true}
                                        maxLength={this.state.pageInputMaxLenght}
                                        placeholder="Page number"
                                        placeholderTextColor='black'
                                        onChangeText={(GoToPage) => this.setState({ GoToPage })}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                    />
                                    <TouchableOpacity
                                        activeOpacity={.9}
                                        onPress={() => {
                                            //console.warn('this.state.GoToPage '+this.state.GoToPage + '\n\n'+this.state.pagNextPrevious)
                                            let totalPage = parseInt(this.state.numberOfPages)
                                            if (this.state.GoToPage != 0 && this.state.GoToPage <= totalPage) {

                                                //currentPageForUpdate
                                                let goToPageParseInt = parseInt(this.state.GoToPage);
                                                if (this.state.pagNextPrevious == goToPageParseInt) {
                                                    if (this.state.pagNextPrevious == this.state.numberOfPages) {
                                                        this.setState({
                                                            dialogVisible: false,
                                                            pagNextPrevious: goToPageParseInt - 1
                                                        }, () => {
                                                            this.setState({
                                                                pagNextPrevious: goToPageParseInt
                                                            })
                                                        })
                                                    } else {
                                                        this.setState({
                                                            dialogVisible: false,
                                                            pagNextPrevious: goToPageParseInt + 1
                                                        }, () => {
                                                            this.setState({
                                                                pagNextPrevious: goToPageParseInt
                                                            })
                                                        })
                                                    }

                                                } else {
                                                    this.setState({
                                                        dialogVisible: false,
                                                        pagNextPrevious: goToPageParseInt
                                                    })
                                                }
                                            }
                                            else if (this.state.GoToPage < 1) {
                                                this.setState({
                                                    dialogVisible: false
                                                })
                                                setTimeout(() => {
                                                    Toast.show('Please enter correct number.')
                                                }, 1000);
                                            }
                                            else if (this.state.GoToPage > totalPage) {
                                                this.setState({
                                                    dialogVisible: false
                                                })
                                                setTimeout(() => {
                                                    Toast.show('Please enter correct number.')
                                                }, 1000);
                                            }
                                            else {
                                                this.setState({
                                                    dialogVisible: false
                                                })
                                                setTimeout(() => {
                                                    Toast.show('Please enter Page number.')
                                                }, 1000);
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            backgroundColor: colors.theme,
                                            padding: 10,
                                            marginTop: 20,
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>{'SUBMIT'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Dialog>
                    }
                    {
                        this.state.showMenu ? (
                            <Modal visible={this.state.showMenu}
                                transparent={true}
                                animationType="none"
                                onRequestClose={() => this.setState({
                                    showMenu: false
                                })}
                            >
                                <TouchableOpacity onPress={() => this.setState({
                                    showMenu: false
                                })}
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%'
                                    }}>
                                    <View style={{
                                        position: 'absolute',
                                        backgroundColor: 'white',
                                        justifyContent: 'center',
                                        alignSelf: 'auto', height: 'auto',
                                        width: 'auto', top: 50, right: 10,
                                        minWidth: 140
                                    }}>
                                        <FlatList
                                            showsVerticalScrollIndicator={false}
                                            data={this.state.menuTopicArray}
                                            extraData={this.state}
                                            keyExtractor={(item, index) => index.toString()}
                                            renderItem={({ item, index }) => (
                                                <TouchableOpacity
                                                    onPress={() => this.menuItemPress(item)}>

                                                    <View style={{
                                                        flexDirection: 'column',
                                                        borderWidth: 1,
                                                        borderRadius: 1,
                                                        borderColor: '#f1f1f1'
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            paddingHorizontal: 10,
                                                            paddingVertical: 10
                                                        }}>
                                                            <Text style={{ fontSize: 14, fontWeight: '500', color: 'black' }}>{item}</Text>
                                                        </View>
                                                        <View style={{
                                                            width: 'auto', height: .2,
                                                            backgroundColor: '#f1f1f1'
                                                        }} />
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </Modal>) : null
                    }
                </View>
            )
        }
    }
}




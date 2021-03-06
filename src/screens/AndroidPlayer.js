'use strict';

import React, {
    Component
} from 'react';

import {
    AppRegistry,
    StyleSheet,
    Text,
    TouchableOpacity, ActivityIndicator,
    View
} from 'react-native';

import Video from 'react-native-video';
import colors from '../resources/colors';
import CONSTANTS from '../resources/constants';
import dimensions from '../resources/dimension';
export default class AndroidPlayer extends Component {
    constructor(props) {
        super(props);
        this.state = {

            rate: 1,
            volume: 1,
            muted: false,
            //resizeMode: 'contain',
            duration: 0.0,
            currentTime: 0.0,
            paused: false,
            isVideoLoading: true
        }
    }
    //video: Video;

    componentDidMount() {
        // global.navigation = this.props.navigation

    }



    onLoad = (data) => {
        if (this.state.isVideoLoading == true) {
            this.setState({ duration: data.duration, isVideoLoading: false });
        } else {
            this.setState({ duration: data.duration });

        }
    };

    onLoadStart(data) {
        console.log('On load fired!' + this.state.isVideoLoading);
        // if (this.state.isVideoLoading != undefined) { 
        //     this.setState({ isVideoLoading: true });

        // }
    }
    onBuffer = () => {
        console.log('buffiring ')

    }
    onProgress = (data) => {
        this.setState({ currentTime: data.currentTime });
    };
    onPlaybackStalled = () => {
        console.log('onPlaybackStalled')
        // this.setState({ paused: false })
    };
    onError = (error) => {
        console.log(error)
    };
    onEnd = () => {
        // this.setState({ paused: true })
        this.video.seek(0)
    };

    onAudioBecomingNoisy = () => {
        // this.setState({ paused: true })
    };

    onAudioFocusChanged = (event: { hasAudioFocus: boolean }) => {
        // this.setState({ paused: !event.hasAudioFocus })
    };

    getCurrentTimePercentage() {
        if (this.state.currentTime > 0) {
            return parseFloat(this.state.currentTime) / parseFloat(this.state.duration);
        }
        return 0;
    };

    renderRateControl(rate) {
        const isSelected = (this.state.rate === rate);

        return (
            <TouchableOpacity onPress={() => { this.setState({ rate }) }}>
                <Text style={[styles.controlOption, { fontWeight: isSelected ? 'bold' : 'normal' }]}>
                    {rate}x
        </Text>
            </TouchableOpacity>
        );
    }

    renderResizeModeControl(resizeMode) {
        const isSelected = (this.state.resizeMode === resizeMode);

        return (
            <TouchableOpacity onPress={() => { this.setState({ resizeMode }) }}>
                <Text style={[styles.controlOption, { fontWeight: isSelected ? 'bold' : 'normal' }]}>
                    {resizeMode}
                </Text>
            </TouchableOpacity>
        )
    }

    renderVolumeControl(volume) {
        const isSelected = (this.state.volume === volume);

        return (
            <TouchableOpacity onPress={() => { this.setState({ volume }) }}>
                <Text style={[styles.controlOption, { fontWeight: isSelected ? 'bold' : 'normal' }]}>
                    {volume * 100}%
        </Text>
            </TouchableOpacity>
        )
    }

    render() {
        const flexCompleted = this.getCurrentTimePercentage() * 100;
        const flexRemaining = (1 - this.getCurrentTimePercentage()) * 100;

        return (
            <View style={styles.container}>
                {/* <TouchableOpacity
                    style={styles.fullScreen}
                    onPress={() => this.setState({ paused: !this.state.paused })}
                > */}
                <Video
                    ref={(ref: Video) => { this.video = ref }}
                    controls={this.props.controlType != undefined && this.props.controlType != null &&
                        this.props.controlType == 'live_session' ? false : true}
                    /* For ExoPlayer */
                    /* source={{ uri: 'http://www.youtube.com/api/manifest/dash/id/bf5bb2419360daf1/source/youtube?as=fmp4_audio_clear,fmp4_sd_hd_clear&sparams=ip,ipbits,expire,source,id,as&ip=0.0.0.0&ipbits=0&expire=19000000000&signature=51AF5F39AB0CEC3E5497CD9C900EBFEAECCCB5C7.8506521BFC350652163895D4C26DEE124209AA9E&key=ik0', type: 'mpd' }} */
                    // source={require('./broadchurch.mp4')}
                    source={{ uri: this.props.url }}
                    style={styles.fullScreen}
                    rate={this.props.rate}

                    paused={false}//{this.state.paused}
                    volume={this.state.volume}
                    muted={this.state.muted}
                    resizeMode={this.props.resizeMode != undefined && this.props.resizeMode != null &&
                        this.props.resizeMode == 'stretch' ? 'stretch' : 'contain'}
                    // onLoadStart={this.onLoadStart}
                    onLoad={this.onLoad}
                    onBuffer={this.onBuffer}                // Callback when remote video is buffering
                    poster={this.props.poster}
                    posterResizeMode={'contain'}              // Callback when remote video is buffering
                    playInBackground={true}
                    playWhenInactive={true}
                    onProgress={this.onProgress}
                    onError={this.onError}
                    onPlaybackStalled={this.onPlaybackStalled}
                    onEnd={this.onEnd}
                    onAudioBecomingNoisy={this.onAudioBecomingNoisy}
                    onAudioFocusChanged={this.onAudioFocusChanged}
                    repeat={false}
                    selectedVideoTrack={this.props.selectedVideoTrack}
                />
                {/* </TouchableOpacity> */}

                {/* <View style={styles.controls}>
                    <View style={styles.generalControls}>
                        <View style={styles.rateControl}>
                            {this.renderRateControl(0.25)}
                            {this.renderRateControl(0.5)}
                            {this.renderRateControl(1.0)}
                            {this.renderRateControl(1.5)}
                            {this.renderRateControl(2.0)}
                        </View>

                        <View style={styles.volumeControl}>
                            {this.renderVolumeControl(0.5)}
                            {this.renderVolumeControl(1)}
                            {this.renderVolumeControl(1.5)}
                        </View>

                        <View style={styles.resizeModeControl}>
                            {this.renderResizeModeControl('cover')}
                            {this.renderResizeModeControl('contain')}
                            {this.renderResizeModeControl('stretch')}
                        </View>
                    </View>

                    <View style={styles.trackingControls}>
                        <View style={styles.progress}>
                            <View style={[styles.innerProgressCompleted, { flex: flexCompleted }]} />
                            <View style={[styles.innerProgressRemaining, { flex: flexRemaining }]} />
                        </View>
                    </View>
                </View> */}

                {
                    this.state.isVideoLoading == true ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                        <ActivityIndicator />
                        <Text style={{
                            top: 10, fontSize: (dimensions.sizeRatio * 14),
                            textAlignVertical: "center", color: colors.white,
                            fontFamily: CONSTANTS.DEMI
                        }}>{`buffering ${this.props.buffingName}...`}</Text>
                    </View> : null
                }

            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        //zIndex:2
    },
    fullScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },

    controls: {
        backgroundColor: 'transparent',
        borderRadius: 5,
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    progress: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 3,
        overflow: 'hidden',
    },
    innerProgressCompleted: {
        height: 20,
        backgroundColor: '#cccccc',
    },
    innerProgressRemaining: {
        height: 20,
        backgroundColor: '#2C2C2C',
    },
    generalControls: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 4,
        overflow: 'hidden',
        paddingBottom: 10,
    },
    rateControl: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    volumeControl: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    resizeModeControl: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlOption: {
        alignSelf: 'center',
        fontSize: 11,
        color: 'white',
        paddingLeft: 2,
        paddingRight: 2,
        lineHeight: 12,
    },
});
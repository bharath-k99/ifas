/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  Text,
  View,
  Image,
  StatusBar,
  TouchableOpacity,
  Alert,
  AsyncStorage,
  NativeEventEmitter,
  NativeModules,
  Modal,
  FlatList,
} from "react-native";
import colors from "../../resources/colors";
import renderIf from "../../resources/utility.js";
import dimensions from "../../resources/dimension";
import CONSTANTS from "../../resources/constants";
import styles from "../../styles/sessions_style.js";
import { showNativeAlert } from "../../resources/app_utility.js";
import { EventRegister } from "react-native-event-listeners";
import { NavigationEvents } from "react-navigation";
import { Dialog } from "react-native-simple-dialogs";
import Toast from "react-native-tiny-toast";
import Ripple from "react-native-material-ripple";
import CardView from "react-native-cardview";
import Orientation from "react-native-orientation";
import { StackActions, NavigationActions } from "react-navigation";

//vector icon
import BookIcon from "react-native-vector-icons/FontAwesome5";
const bookIcon = <BookIcon name="book" size={28} color={colors.theme} />;
import ForwordIcon from "react-native-vector-icons/MaterialIcons";
const forwordIcon = (
  <ForwordIcon name="arrow-forward" size={24} color={colors.theme} />
);
import BackButton from "react-native-vector-icons/MaterialIcons";
const backButton = (
  <BackButton name="arrow-back" size={28} color={colors.black} />
);
import VideoIcon from "react-native-vector-icons/Feather";
const videoIcon = (
  <VideoIcon name="video" size={16} color={colors.lightishgray} />
);
import VideoIcon1 from "react-native-vector-icons/Feather";
const videoIcon1 = (
  <VideoIcon name="video" size={16} color={colors.topic_text_color_5} />
);
import ViewPDFBigIcon from "react-native-vector-icons/FontAwesome5";
const viewPDFBigIcon = (
  <ViewPDFBigIcon name="file-pdf" size={28} color={colors.theme} />
);
import ViewPDFIcon from "react-native-vector-icons/FontAwesome5";
const viewPDFIcon = (
  <ViewPDFIcon name="file-pdf" size={16} color={colors.topic_text_color_5} />
);
const viewPDFIcon1 = (
  <ViewPDFIcon name="file-pdf" size={16} color={colors.lightishgray} />
);
import TestPDFBigIcon from "react-native-vector-icons/FontAwesome5";
const testPDFBigIcon = (
  <TestPDFBigIcon name="clipboard-list" size={28} color={colors.theme} />
);
import VideoBigIcon from "react-native-vector-icons/Feather";
const videoBigIcon = (
  <VideoBigIcon name="video" size={28} color={colors.theme} />
);
import ClipboardIcon from "react-native-vector-icons/FontAwesome5";
const clipboardIcon = (
  <ClipboardIcon
    name="clipboard-list"
    size={16}
    color={colors.topic_text_color_6}
  />
);
let isRecordingGloble = false;

export default class FreeVideoList001 extends Component {
  //Navigation Method
  isSessionFocus = false;
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      access_token: "",
      isRecording: false,
      isRecording: "",
      freeVideoArray: [],
    };
  }

  componentDidMount() {
    console.warn("type", this.props.navigation.state.params.type);
    this.getAccessToken();
  }
  componentWillUnmount() {}

  getAccessToken() {
    let self = this;
    AsyncStorage.getItem("ACCESS_TOKEN").then((value) => {
      if (value !== null) {
        console.log("VALUE:" + value);
        self.setState(
          {
            access_token: value.slice(1, -1),
          },
          () => {
            console.warn("enter2");
            self.getTopicApi(this.props.navigation.state.params.selected_item);
          }
        );
      } else {
        // showNativeAlert('Not logged-In')
      }
    });
  }

  getTopicApi(selectedItem) {
    const formData = new FormData();
    formData.append("access_token", this.state.access_token);
    formData.append("course_id", selectedItem.course_id);
    formData.append("subject_id", selectedItem.subject_id);
    formData.append("type", this.props.navigation.state.params.type);
    console.warn("REQUEST_FREE_TOP", formData);

    fetch(CONSTANTS.BASE + CONSTANTS.POST_FREE_VIDEOS_LIST_NEW, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.warn("TOPIC_NEW", responseJson);

        if (responseJson.code == 201) {
          this.removeItemValue("ACCESS_TOKEN");
        } else {
          this.setState({
            isLoading: false,
            isRefreshFetching: false,
            freeVideoArray: responseJson.data,
          });
        }
      })
      .catch((error) => {
        // console.error(error);
        // showNativeAlert("Network request failed")
        this.setState({
          freeVideoArray: [],
          isLoading: false,
          isRefreshFetching: false,

          errorMessage: "Failed to fetch your Topics.",
        });
      });
  }

  getInstructionApi(item, parentItem) {
    const formData = new FormData();
    formData.append("access_token", this.state.access_token);
    formData.append("exam_set_id", item.EXAM_SET_ID);
    console.warn("request_data_ins_paid", formData);

    fetch(CONSTANTS.BASE + CONSTANTS.POST_TEST_INSTRUCTION, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.warn("INSTRUCTION_RESPONSE", responseJson);

        if (responseJson.code == 201) {
          this.removeItemValue("ACCESS_TOKEN");
        } else {
          global.isFreeVideoList001 = true;
          //Handle here for exam alreay given or not
          console.warn("LENGTTT", item);
          if (responseJson.user_exam_obj && responseJson.user_exam_obj.length) {
            //this.props.navigation.navigate('Instructions', { data: {}, selected_item: item, parent_item: parentItem });
            this.props.navigation.navigate("ReviewTest", {
              url: "",
              data: {},
              selected_item: responseJson.user_exam_obj[0],
            });
          } else {
            this.props.navigation.navigate("Instructions", {
              data: {},
              selected_item: item,
              parent_item: parentItem,
            });
            //this.callEnrollUserExam(item,parentItem)
          }
        }
      })
      .catch((error) => {
        // console.error(error);
        // showNativeAlert("Network request failed")
        this.setState({
          isLoading: false,
          errorMessage: "Failed to fetch your subjects.",
        });
      });
  }

  removeItemValue(key) {
    let self = this;
    AsyncStorage.removeItem(key).then(
      () => {
        self.logoutUser();
      },
      () => {
        console.log("rejected");
      }
    );
  }

  logoutUser() {
    showNativeAlert(CONSTANTS.LOGOUT_MESSAGE);
    CONSTANTS.IS_LOGGED_IN = false;
    //this.props.navigation.popToTop()
    this.clearPreviousStackCourse();
  }

  clearPreviousStackCourse = () => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "Courses" })],
    });
    this.props.navigation.dispatch(resetAction);
  };

  handleBackButtonClick = () => {
    global.isChatLiveSessionVisible = true;
    this.props.navigation.goBack();
    return true;
  };

  clickMainViewItem = (item, index) => {
    let savedTopicArray = this.state.freeVideoArray;
    savedTopicArray.map((element) => {
      if (item.ID == element.ID) {
        element.is_selected = true;
      } else {
        element.is_selected = false;
      }
    });

    this.setState({
      freeVideoArray: [...savedTopicArray],
    });
  };
  render() {
    if (this.state.isLoading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            color: colors._transparent,
            padding: 20,
          }}
        >
          <ActivityIndicator />
          <Text
            style={{
              top: 10,
              fontSize: dimensions.sizeRatio * 20,
              textAlignVertical: "center",
              color: colors.black,
              fontFamily: CONSTANTS.DEMI,
            }}
          >
            Loading session...
          </Text>
        </View>
      );
    }
    if (this.state.isRecording) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <ActivityIndicator />

          <Text
            style={{
              top: 10,
              fontSize: dimensions.sizeRatio * 15,
              textAlignVertical: "center",
              color: colors.black,
              fontFamily: CONSTANTS.DEMI,
            }}
          >
            ⚠️ Video Recording not allowed!! ⚠️
          </Text>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, backgroundColor: colors.sessions_bgtheme }}>
          {/* Header view */}
          {this.renderHeader()}
          <View
            style={{
              flex: 1,
              width: "100%",
              padding: 10,
            }}
          >
            <FlatList
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              //numColumns={2}
              data={this.state.freeVideoArray}
              renderItem={({ item, index }) =>
                this.renderSubjectsList(item, index)
              }
              extraData={this.state}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      );
    }
  }

  renderSubjectsList = (item, index) => {
    console.warn("item  ", item.topic_videos[0]);
    return (
      <CardView
        style={{
          flex: 1,
          backgroundColor: colors.white,
          marginHorizontal: 10,
          marginVertical: 10,
        }}
        cardElevation={3}
        cardMaxElevation={2}
        cornerRadius={5}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "column",
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            style={{
              flexDirection: "row",
              width: "100%",
              paddingHorizontal: 10,
              paddingVertical: 10,
            }}
            onPress={() => {
              this.clickMainViewItem(item, index);
            }}
          >
            <View
              style={{
                width: "83%",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {this.props.navigation.state.params.type == 3
                  ? viewPDFBigIcon
                  : viewPDFBigIcon}
              </View>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  marginTop: 5,
                  marginLeft: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: dimensions.sizeRatio * 16,
                    color: colors.black,
                    fontFamily: CONSTANTS.MEDIUM,
                  }}
                  numberOfLines={1}
                >
                  {item.NAME}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  {this.props.navigation.state.params.type == 3
                    ? viewPDFIcon1
                    : viewPDFIcon1}
                  <Text
                    style={{
                      marginLeft: 5,
                      fontSize: dimensions.sizeRatio * 12,
                      color: colors.lightishgray,
                      fontFamily: CONSTANTS.REGULAR,
                    }}
                    numberOfLines={1}
                  >
                    {item.topic_videos.length == 0
                      ? 0
                      : item.topic_videos.length}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                width: "17%",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 30 / 2,
                  backgroundColor: colors.theme_very_light,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {forwordIcon}
              </View>
            </View>
          </TouchableOpacity>
          {/* Sub item map */}
          {item.is_selected && (
            <View
              style={{
                width: "100%",
                flexDirection: "column",
              }}
            >
              <View
                style={{
                  width: "90%",
                  height: 1,
                  backgroundColor: colors.lightgray,
                  alignSelf: "center",
                }}
              />
              {item.topic_videos != undefined &&
                item.topic_videos != null &&
                item.topic_videos.map((element) => {
                  return (
                    <View
                      style={{
                        width: "100%",
                        padding: 10,
                      }}
                    >
                      {/* Top title view */}
                      <View
                        style={{
                          width: "100%",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: dimensions.sizeRatio * 14,
                            color: colors.black,
                            fontFamily: CONSTANTS.DEMI,
                          }}
                          numberOfLines={1}
                        >
                          {element.TITLE}
                        </Text>
                      </View>
                      {/* bottom view */}
                      <View
                        style={{
                          width: "100%",
                          flexDirection: "column",
                        }}
                      >
                        {this.props.navigation.state.params.type == 3 && (
                          <View
                            style={{
                              width: "100%",
                              marginTop: 5,
                            }}
                          >
                            <Ripple
                              style={{
                                width: "45%",
                                padding: 10,
                                backgroundColor: colors.topic_color_5,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "flex-start",
                              }}
                              onPress={() => {
                                if (
                                  element.EBOOK_URL != null &&
                                  element.EBOOK_URL != ""
                                ) {
                                  this.props.navigation.navigate(
                                    "PDFViewerScreen",
                                    {
                                      selected_item: element,
                                      screen_name: "topic",
                                      selected_ebook_type: "view",
                                    }
                                  );
                                } else {
                                  setTimeout(() => {
                                    Toast.show("PDF not found!", Toast.CENTER);
                                  }, 200);
                                }
                              }}
                            >
                              {viewPDFIcon}
                              <Text
                                style={{
                                  marginLeft: 5,
                                  fontSize: dimensions.sizeRatio * 14,
                                  color: colors.topic_text_color_5,
                                  fontFamily: CONSTANTS.MEDIUM,
                                }}
                                numberOfLines={1}
                              >
                                {"View PDF"}
                              </Text>
                            </Ripple>
                          </View>
                        )}

                        {this.props.navigation.state.params.type == 2 && (
                          <View
                            style={{
                              flexDirection: "row",
                              width: "100%",
                              marginTop: 5,
                            }}
                          >
                            {element.EXAM_SET_ID !== null &&
                              element.EXAM_SET_ID !== "" &&
                              element.EXAM_SET_ID !== 0 && (
                                <Ripple
                                  style={{
                                    width: "45%",
                                    padding: 10,
                                    backgroundColor: colors.topic_color_6,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                  }}
                                  onPress={() => {
                                    this.getInstructionApi(element, item);
                                  }}
                                >
                                  {clipboardIcon}
                                  <Text
                                    style={{
                                      marginLeft: 5,
                                      fontSize: dimensions.sizeRatio * 14,
                                      color: colors.topic_text_color_6,
                                      fontFamily: CONSTANTS.MEDIUM,
                                    }}
                                    numberOfLines={1}
                                  >
                                    {"Test"}
                                  </Text>
                                </Ripple>
                              )}
                              <View
                              style={{
                                width: "10%",
                              }}
                            />
                            {element.URL !== null && element.URL !== "" && (
                              <Ripple
                                style={{
                                  width: "45%",
                                  padding: 10,
                                  backgroundColor: colors.topic_color_5,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "flex-start",
                                }}
                                onPress={() => {
                                  this.props.navigation.navigate(
                                    "FreeVideoPlayer",
                                    {
                                      selected_item: element,
                                      screen_name: "FreeVideoList",
                                    }
                                  );
                                }}
                              >
                                {videoIcon1}
                                <Text
                                  style={{
                                    marginLeft: 5,
                                    fontSize: dimensions.sizeRatio * 14,
                                    color: colors.topic_text_color_5,
                                    fontFamily: CONSTANTS.MEDIUM,
                                  }}
                                  numberOfLines={1}
                                >
                                  {"View Video"}
                                </Text>
                              </Ripple>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
            </View>
          )}
        </View>
      </CardView>
    );
  };

  renderHeader = () => {
    return (
      <View
        style={{
          width: "100%",
          height: 55,
          backgroundColor: colors.white,
          paddingHorizontal: 10,
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Ripple
          onPress={() => {
            this.handleBackButtonClick();
          }}
        >
          {backButton}
        </Ripple>
        <Text
          style={{
            fontSize: 18,
            fontFamily: CONSTANTS.DEMI,
            color: colors.black,
            textAlign: "left",
            marginLeft: 15,
          }}
        >
          {/* {"Free Topic Videos"} */}
          {this.props.navigation.state.params.type == 2
            ? "Free Test Series"
            : "Free Study Material"}
        </Text>
      </View>
    );
  };
}

//   ) : item.EXAM_SET_ID !== null &&
//     item.EXAM_SET_ID !== "" &&
//     item.EXAM_SET_ID !== 0 ? (
//     <Ripple
//       style={{
//         width: "45%",
//         padding: 10,
//         backgroundColor: colors.topic_color_6,
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "flex-start",
//       }}
//       onPress={() => {
//         this.getInstructionApi(item, item);
//       }}
//     >
//       {clipboardIcon}
//       <Text
//         style={{
//           marginLeft: 5,
//           fontSize: dimensions.sizeRatio * 14,
//           color: colors.topic_text_color_6,
//           fontFamily: CONSTANTS.MEDIUM,
//         }}
//         numberOfLines={1}
//       >
//         {"Test"}
//       </Text>
//     </Ripple>
//   ) : null}

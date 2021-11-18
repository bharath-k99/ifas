const constants = {
  //CONSTANT VALUES/MESSAGES
  APP_NAME: 'IFAS',
  iOS: 'ios',
  ANDROID: 'android',
  APP_HAS_LAUNCHED: false,

  //API
  // DYNAMIC = 'http://dynamicwebsite.co.in/pa/ifas/apis/',
  // LIVE = 'http://dynamicwebsite.co.in/pa/ifas/apis/',

  //  BASE: 'http://dynamicwebsite.co.in/pa/ifas/apis/',
  //MAIN BASE: 'http://dynamicwebsite.co.in/pa/ifas_dev/apis/',


  //BASE: 'http://192.168.100.59/ifas_dev/apis/',  DEV

  // BASE:'http://192.168.100.104/sites/ifas/ifas/apis/', // MAIN LIVE SERVER // 'http://ifasonline.com/ifas_dev/apis/', //
  // BASE_CHAT: 'http://192.168.100.104/sites/ifas/ifas_chat/apis/', // MAIN LIVE SERVER // 'http://ifasonline.com/ifas_dev/apis/', //
  BASE_IMG_URL: 'https://ifas-data.s3.ap-south-1.amazonaws.com/chat_img/', // MAIN LIVE SERVER // 'http://ifasonline.com/ifas_dev/apis/', //
  BASE_SUPPORT_URL: 'https://ifas-data.s3.ap-south-1.amazonaws.com/tech_support_img/', // MAIN LIVE SERVER // 'http://ifasonline.com/ifas_dev/apis/', //
  BASE_GROUP_URL: 'https://ifas-data.s3.ap-south-1.amazonaws.com/group_chat_img/', // MAIN LIVE SERVER // 'http://ifasonline.com/ifas_dev/apis/', //
  BASE_QUESTION_URL: "https://ifas-data.s3.ap-south-1.amazonaws.com/question_data/question_images/", // MAIN LIVE SERVER // 'http://ifasonline.com/ifas_dev/apis/', //
  BASE_ANSWER_URL: "https://ifas-data.s3.ap-south-1.amazonaws.com/question_data/question_option_images/", // MAIN LIVE SERVER // 'http://ifasonline.com/ifas_dev/apis/', //
  // BASE: 'http://192.168.100.104/sites/ifas/ifas_chat/apis/', // MAIN LIVE SERVER // 'http://ifasonline.com/ifas_dev/apis/', //

  //QA
  // BASE_CHAT: 'http://13.56.221.121/pa/IFAS20/apis/', // MAIN LIVE SERVER // 'http://ifasonline.com/ifas_dev/apis/', //
  // BASE: 'http://13.56.221.121/pa/IFAS20/apis/', // MAIN LIVE SERVER // 'http://ifasonline.com/ifas_dev/apis/', //

  //PRAVEEN5APRIL2020 -3:36PM (CHANGE URL)
  //LIVE
  //BASE: 'http://ifaslive-env.tbbbbmm9u5.ap-south-1.elasticbeanstalk.com/apis/',
  //BASE_CHAT: 'http://ifaslive-env.tbbbbmm9u5.ap-south-1.elasticbeanstalk.com/apis/',

  //BASE: 'http://35.154.11.3/pa/ifas/apis/',
  //BASE_CHAT: 'http://35.154.11.3/pa/ifas/apis/',

  //BASE: 'http://13.127.45.62/pa/ifas_qa/apis/',
  //BASE_CHAT: 'http://13.127.45.62/pa/ifas_qa/apis/',

  BASE: 'http://apis.ifasonline.com/apis/',
  BASE_CHAT: 'http://apis.ifasonline.com/apis/',

  GET_COURSES: 'getCourses.json',
  POST_FREE_VIDEOS: 'getFreeVideos.json',
  POST_LOGIN: 'login.json',
  POST_SUBJECTS: 'getSubjectList.json',
  POST_TOPICS: 'getTopics.json',
  POST_LIVE_SESSIONS: 'getLiveSessionsNew.json',
  PROFILE: 'getUserProfile.json',
  GET_VIDEO_LOG: 'getVideoLog.json',
  GET_VIDEO_LOG_FREE: 'getVideoLogFree.json',
  SET_VIDEO_LOG: 'setVideoLog.json',
  LOGOUT: 'logout.json',
  CHECK_ACCESS_TOKEN: 'checkAccessToken.json',
  SEND_MESSAGE: 'sendMessage.json',
  GET_MESSAGE_LIST: 'getThreadList.json',
  GET_CHAT_DETAIL: 'getMessageList.json',
  SEND_FEEDBACK: 'setFeedback.json',
  GET_CONFERENCES: 'getLiveConferencesNew.json',
  GET_LIVE_SESSION_COMMENTS: 'getLiveSessionsComment.json',
  STORE_LIVE_SESSION_COMMENTS: 'storeLiveSessionsComment.json',
  POST_EXTRACTION_LOG: 'createExtractionLog.json',
  POST_NOTIFICATION_LIST: 'getUserNotificationListNew.json',

  //second phase api for free user
  POST_FREE_COURSES_NEW: 'getCoursesNew.json',
  POST_FREE_SUBJECT_LIST_NEW: 'getSubjectListNew.json',
  //POST_FREE_VIDEOS_LIST_NEW:'getFreeVideosNew.json',
  POST_FREE_VIDEOS_LIST_NEW: 'getFreeUserTopicAndVideos.json',
  POST_FREE_LIVE_SESSIONS: 'getLiveSessionsNew.json',
  POST_FREE_LIVE_CONFERENCES: 'getLiveConferencesNew.json',
  POST_FREE_NOTIFICATION_LIST_NEW: 'getUserNotificationListNew.json',
  //second phase api TECH SUPPORT MSG
  POST_SEND_TECH_SUPPORT_NEW: 'sendTechSupportMessage.json',
  POST_SEND_TECH_SUPPORT_THREAD_LIST_NEW: 'getTechSupportThreadList.json',
  POST_SEND_TECH_SUPPORT_LIST_NEW: 'getTechSupportMessageList.json',
  POST_GROUP_LIST_NEW:'getGroupMessage.json',
  POST_GROUP_SEND_NEW:'sendGroupMessage.json',


  //second phase api for apid user
  POST_PAID_EBOOK_TOPIC_LIST_NEW: 'getTopicsNew.json',
  POST_PAID_VIDEO_TOPIC_LIST_NEW: 'getTopicsNew.json',
  POST_PAID_VIDEO_LOG_NEW: 'setVideoLogNew.json',
  POST_PAID_MESSAGE_SEND_NEW: 'sendMessageNew.json',

  POST_RESOLVED_CHAT_QUERY_NEW: 'resolveMessageThread.json',
  // COMMON DELETE API
  POST_NORMAL_SUPPORT_GROUP_DELETE_MESSAGE:'deleteMessages.json',

    //Third phase api for test
    POST_TEST_ENROLLUSER:'enrollUserExam.json',
    POST_TEST_QUESTIONS:'getQuestions.json',
    POST_TEST_SAVE_ANSWER:'saveAnswer.json',
    POST_TEST_INSTRUCTION:'getInstruction.json',


  //FONT
  DEMI: 'AvenirNextLTPro-Demi',
  REGULAR: 'AvenirNextLTPro-Regular',
  MEDIUM: 'AvenirNextLTPro-Medium',

  //TOP VIEW CONTROLLER
  TOP_SCREEN: '',
  PREVIOUS_SCREEN_FOR_STREAMING: '',


  SESSION_TIMER: 0,
  VIDEO_TYPE: 1,

  //MESSAGES
  LOGOUT_MESSAGE: 'Your session has been expired. Please login again to continue.',
  SWW_MESSAGE: 'Something went wrong. Please try again later.',
  NO_SUBJECT_MESSAGE: 'Please select subject name.',
  NO_CHAT_TITLE_MESSAGE: 'Please enter title.',
  NO_CHAT_MESSAGE_OR_IMAGE: 'Please enter either chat message or chat image.',
  MESSAGE_SUCCESS: 'Message sent successfully.',
  FEEDBACK_SUCCESS: 'Feedback sent successfully.',
  FEEDBACK_ALREADY_ERROR: 'You have already submitted feedback for this chat.',
  FEEDBACK_TEACHER_ERROR: 'Teacher cannot submit a feedback.',
  NO_FEEDBACK_RATE: 'Please select rate type.',
  NOT_FEEDBACK_MESSAGE: 'Please enter feedback.',


  //DEVICE TOKEN
  DEVICE_TOKEN: '',
  IS_LOGGED_IN: false,
  VIDEO_URL: '',

  //ADMIN DETAILS
  ADMIN_EMAIL: 'admin@ifasonline.com',
  ADMIN_PHONE: '9172266888',

  SESSION_START_DATE: '',
  SESSION_END_DATE: '',
  SESSION_TEACHER_ID: undefined,

  //Async Storage key
  STORE_QUALITY: 'store_quality'

};
export default constants;

export class textInputPlaceholders {
  static title = 'Title';
  static message = 'Message';
  static sendMessage = 'Write Message';
  static subName = 'Select subject name';
  static review = 'Enter feedback';
}
export class constantStrings {
  static subject = 'Subject';
  static title = 'Title';
  static message = 'Message';
  static uploadImage = 'Upload Image';
  static send = 'SEND';
  static submitReview = 'SUBMIT REVIEW';
}
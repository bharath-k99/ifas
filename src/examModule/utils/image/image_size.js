import {
    Image
} from 'react-native';

export const imageSize = (url, widthParam, heightParam) => {
  
    Image.getSize(url, (width, height) => {
        this.setState({
            width: widthParam, 
            height: 250
        }); 
    }, (error) => {
        console.log("ScaledImage:componentWillMount:Image.getSize failed with error: ", error)
    });
};




// import * as React from 'react';
// import {
//     Image
// } from 'react-native';

// export default class ScaledImage extends React.Component {
//     constructor(props) {
//         super(props)
//         this.state = {
//             source: {uri: this.props.uri},
//             width: 0,
//             height: 0,
//         }
//     }

//     componentWillMount() {
//         Image.getSize(this.props.uri, (width, height) => {
//             if (this.props.width && !this.props.height) {
//                 console.log("Image.getSize(this.props.uri, (width, height)");
//                 console.log(height * (this.props.width / width));
//                 console.log(this.props.width );
//                 this.setState({
//                     width: this.props.width, 
//                     height: 250
//                 });
//             } else if (!this.props.width && this.props.height) {
//                 this.setState({width: width * (this.props.height / height), height: this.props.height})
//             } else {
//                 console.log("else Image.getSize(this.props.uri, (width, height)");
//                 this.setState({width: width, height: height})
//             }
//         }, (error) => {
//             console.log("ScaledImage:componentWillMount:Image.getSize failed with error: ", error)
//         })
//     }

//     render() {
//         return <Image source={this.state.source} resizeMode = 'contain' style={[this.props.style, {height: this.state.height, width: this.state.width}]}/>
//     }
// }
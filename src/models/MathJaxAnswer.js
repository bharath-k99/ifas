import React from 'react';
import { View, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
//import rnTextSize, { TSFontSpecs } from 'react-native-text-size';
import { NavigationEvents } from 'react-navigation';

const defaultOptions = {
	messageStyle: 'none',
	extensions: ['tex2jax.js'],
	jax: ['input/TeX', 'output/HTML-CSS'],
	tex2jax: {
		inlineMath: [['$', '$'], ['\\(', '\\)']],
		displayMath: [['$$', '$$'], ['\\[', '\\]']],
		processEscapes: true,
	},
	TeX: {
		extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
	}
};

class MathJax extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			height: this.props.heightMath
		};
	}
	async componentDidMount() {

	}
	async _onDidFocus() {
	//console.warn('did_foc_answer')
	// const text = this.props.html;
	// const width = Dimensions.get('window').width * 0.8
	// const size = await rnTextSize.measure({
	// 	text,             // text to measure, can include symbols
	// 	width
	// });
	// let convertSize = size;
	// console.warn('HEIGHT_ANSWER', JSON.stringify(convertSize));
	// this.setState({
	// 	height: parseInt(convertSize.height) + 30
	// })
	}

	handleMessage(message) {
		console.warn('height_question'+ this.props.heightMath + '\n\n' + this.props.html.length)
		//console.warn('height_answer',message.nativeEvent.data)
		// setTimeout(() => {
		// 	this.setState({
		// 		height: Number(message.nativeEvent.data),
		// 	});
		// }, 500);
	}

	wrapMathjax(content) {
		const options = JSON.stringify(
			Object.assign({}, defaultOptions, this.props.mathJaxOptions)
		);

		return `
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
			<script type="text/x-mathjax-config">
				MathJax.Hub.Config(${options});
				MathJax.Hub.Queue(function() {
					var height = document.documentElement.scrollHeight;
					window.ReactNativeWebView.postMessage(String(height));
					document.getElementById("formula").style.visibility = '';
				});
			</script>
			<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js"></script>
			<div id="formula" style="visibility: hidden;">
				${content}
			</div>
		`;
	}
	render() {
		const html = this.wrapMathjax(this.props.html);

		// Create new props without `props.html` field. Since it's deprecated.
		const props = Object.assign({}, this.props, { html: undefined });

		return (
			<View style={{ height: this.props.heightMath ? (this.props.heightMath * 20) : 150, ...props.style }}>
				<NavigationEvents
					onDidFocus={payload => this._onDidFocus()}
				/>
				<WebView
					scrollEnabled={false}
					onMessage={this.handleMessage.bind(this)}
					source={{ html }}
					{...props}
				/>
			</View>
		);
	}
}

export default MathJax;
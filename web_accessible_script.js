// web_accessible_script.js
if(window.runParams && window.runParams.data) {
    var detail = {data: window.runParams.data}; // Or any specific property you need
    document.dispatchEvent(new CustomEvent('WindowRunParamsData', {detail}));
} else {
    console.log('data not found')
}

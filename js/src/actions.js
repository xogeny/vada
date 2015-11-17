exports.UPDEEP_SET_PATH = 'UPDEEP_SET_PATH';
exports.setPath = function (path, v) {
    return {
        type: exports.UPDEEP_SET_PATH,
        payload: {
            path: path,
            v: v
        }
    };
};

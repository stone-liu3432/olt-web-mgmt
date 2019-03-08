 //  解析后台返回的字符串
 export function analysis(str,pon,ge){
    if(!str) return ''
    var result = [];
    var arr = str.split(',');
    for(var i=0,len=arr.length;i<len;i++){
        var substrs = arr[i];
        if(substrs.indexOf('-') !== -1){
            var subArr = substrs.split('-');
            var min = Number(subArr[0]),max = Number(subArr[subArr.length - 1]);
            if(isNaN(min) || isNaN(max)) throw new TypeError;
            result.push(min);
            for(var j=1;j<max-min;j++){
                result.push(min+j);
            }
            result.push(max);
        }else{
            if(isNaN(Number(substrs))) throw new TypeError;
            result.push(Number(substrs));
        }
    }
    return nomenclature(result,pon,ge)
}

//  根据返回数据，命名端口号
function nomenclature(arr,pon_count,ge_count){
    if(!arr) return ''
    var results = '';
    for(var i=0,len=arr.length;i<len;i++){
        var m = arr[i];
        if(m <= pon_count){
            results += pon_count < 10 ? 'PON0'+ m + ',' : 'PON' + m +',';
        }else if(m > pon_count && m <= (pon_count + ge_count)){
            results += (m - pon_count) < 10 ? 'GE0' + (m - pon_count) + ',' : 'GE' + (m - pon_count) + ',';
        }else{
            results += (m - (pon_count + ge_count)) < 10 ? 'XGE0' + (m - (pon_count + ge_count)) + ',' : 'XGE' + (m - (pon_count + ge_count)) + ',';
        }
    }
    return results.replace(/\,$/,'');
}

//  替换所有双字节字符为空
export function replaceDBCS(str){
    return str.replace(/[^\x00-\x80]/gi, '');
}
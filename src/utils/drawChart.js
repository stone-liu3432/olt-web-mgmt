function drawLineChart(dataArr,canv){
    if(!canv) return
    // 声明所需变量
    var canvas,ctx;
    // 图表属性
    var cWidth, cHeight, cMargin, cSpace;
    var originX, originY;
    // 折线图属性
    var tobalDots, dotSpace, maxValue;
    var totalYNomber;

    // 获得canvas上下文
    canvas = canv;
    if(canvas && canvas.getContext){
        ctx = canvas.getContext("2d");
    }
    initChart(); // 图表初始化
    drawLineLabelMarkers(); // 绘制图表轴、标签和标记
    drawChart(); // 绘制折线图

    // 图表初始化
    function initChart(){
        // 图表信息
        cMargin = 60;
        cSpace = 80;
        /*
            这里是对高清屏幕的处理,
             方法：先将canvas的width 和height设置成本来的两倍
             然后将style.height 和 style.width设置成本来的宽高
             这样相当于把两倍的东西缩放到原来的 1/2，这样在高清屏幕上 一个像素的位置就可以有两个像素的值
             这样需要注意的是所有的宽高间距，文字大小等都得设置成原来的两倍才可以。
        */
        canvas.width = 840;
        canvas.height = 480;
        canvas.style.height = canvas.height/2 + "px";
        canvas.style.width = canvas.width/2 + "px";
        cHeight = canvas.height - cMargin - cSpace;
        cWidth = canvas.width - cMargin - cSpace;
        originX = cMargin + cSpace;
        originY = cMargin + cHeight;

        // 折线图信息
        tobalDots = dataArr.length;
        dotSpace = parseInt( cWidth/tobalDots );
        maxValue = 0;
        for(var i=0; i<dataArr.length; i++){
            var dotVal = parseInt( dataArr[i][1] );
            if( dotVal > maxValue ){
                maxValue = dotVal;
            }
        }
        maxValue  = 100;
        totalYNomber = 10;

        ctx.translate(0.5,0.5);  // 当只绘制1像素的线的时候，坐标点需要偏移，这样才能画出1像素实线
    }

    // 绘制图表轴、标签和标记
    function drawLineLabelMarkers(){
        ctx.font = "24px Arial";
        ctx.lineWidth = 2;
        ctx.fillStyle = "#566a80";
        ctx.strokeStyle = "#566a80";
        // y轴
        drawLine(originX, originY, originX, cMargin);
        // x轴
        drawLine(originX, originY, originX+cWidth, originY);

        // 绘制标记
        drawMarkers();
    }

    // 画线的方法
    function drawLine(x, y, X, Y){
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(X, Y);
        ctx.stroke();
        ctx.closePath();
    }

    // 绘制标记
    function drawMarkers(){
        ctx.strokeStyle = "#E0E0E0";
        // 绘制 y 轴 及中间横线
        var oneVal = parseInt(maxValue/totalYNomber);
        ctx.textAlign = "right";
        for(var i=0; i<=totalYNomber; i++){
            var markerVal =  i*oneVal;
            var xMarker = originX-5;
            var yMarker = parseInt( cHeight*(1-markerVal/maxValue) ) + cMargin;
            ctx.fillText(markerVal, xMarker, yMarker+3, cSpace); // 文字
            if(i>0){
                drawLine(originX+2, yMarker, originX+cWidth, yMarker);
            }
        }

        // 绘制 x 轴 及中间竖线
        ctx.textAlign = "center";
        for(var i=0; i<tobalDots; i++){
            var xMarker = originX+i*dotSpace;
            var yMarker = originY+30;
            if(i === 0) ctx.fillText('30s', xMarker, yMarker, cSpace);
            else if(i === tobalDots - 1) ctx.fillText('0s', xMarker, yMarker, cSpace);
            if(i>0){
                drawLine(xMarker, originY-2, xMarker, cMargin);
            }
        }

        // 绘制标题 y
        ctx.save();
        ctx.rotate(-Math.PI/2);
        ctx.fillText("Rate", -canvas.height/2, cSpace-10);
        ctx.restore();
        // 绘制标题 x
        //ctx.fillText("时间", originX+cWidth/2, originY+cSpace/2+20);

        ctx.fillText('CPU', cMargin , canvas.height - 20);
        ctx.strokeStyle = '#EA7617';
        drawLine(cMargin + 30, originY + cSpace/2 + 12, cMargin + 80, originY + cSpace/2 + 12);
        ctx.fillText('Memory', cMargin + 150, canvas.height - 20);
        ctx.strokeStyle = '#01B0EF';
        drawLine(cMargin + 200, originY + cSpace/2 + 12, cMargin + 250,  originY + cSpace/2 + 12);
    };

    //绘制折线图
    function drawChart(){
        var dotVal,barH,x,y;  //"#49FE79";
        //连线
        ctx.beginPath();
        // cpu
        for(var i=0; i<tobalDots; i++){
            ctx.strokeStyle = "#EA7617";
            dotVal = dataArr[i].cpu;
            barH = parseInt( cHeight*dotVal/maxValue);
            y = originY - barH;
            x = originX + dotSpace*i;
            if(i==0){
                ctx.moveTo( x, y );
            }else{
                ctx.lineTo( x, y );
            }
            ctx.stroke();
            ctx.fillStyle = '#EA7617';
            if(dotVal >= 70){
                ctx.fillStyle = 'red';
            }
            drawArc( x, y);
            ctx.font="28px Arial";
            if(i === 0){
                if((dataArr[i].cpu - dataArr[i].memory < 20) && (dataArr[i].cpu - dataArr[i].memory >= 0)){
                    ctx.fillText(parseInt(dotVal), x + 20, y-10);
                }else{
                    ctx.fillText(parseInt(dotVal), x + 20, y+30);
                }
                continue;
            }
            if((dataArr[i].cpu - dataArr[i].memory < 20) && (dataArr[i].cpu - dataArr[i].memory >= 0)){
                ctx.fillText(parseInt(dotVal), x, y-10);
            }else{
                ctx.fillText(parseInt(dotVal), x, y+30);
            }
        }
        ctx.closePath();
        ctx.beginPath();
        // memory
        for(var i=0;i<tobalDots; i++){
            ctx.strokeStyle = "#01B0EF";
            dotVal = dataArr[i].memory;
            barH = parseInt( cHeight*dotVal/maxValue);
            y = originY - barH;
            x = originX + dotSpace*i;
            if(i==0){
                ctx.moveTo( x, y );
            }else{
                ctx.lineTo( x, y );
            }
            ctx.stroke();
            drawArc( x, y);
            ctx.fillStyle = "#01B0EF";
            if(ctx.dotVal >= 70){
                ctx.fillStyle = 'red';
            }
            ctx.font="28px Arial";
            if(i === 0){
                if((dataArr[i].memory - dataArr[i].cpu < 20) && (dataArr[i].memory - dataArr[i].cpu >= 0)){
                    ctx.fillText(parseInt(dotVal), x + 20, y-10);
                }else{
                    ctx.fillText(parseInt(dotVal), x + 20, y+30);
                }
                continue;
            }
            if((dataArr[i].memory - dataArr[i].cpu < 20) && (dataArr[i].memory - dataArr[i].cpu >= 0)){
                ctx.fillText(parseInt(dotVal), x, y-10);
            }else{
                ctx.fillText(parseInt(dotVal), x, y+30);
            }
        }
    }
    //绘制圆点
    function drawArc( x, y, X, Y ){
        ctx.beginPath();
        ctx.arc( x, y, 3, 0, Math.PI*2 );
        ctx.fill();
        ctx.closePath();
    }
}

export default drawLineChart;
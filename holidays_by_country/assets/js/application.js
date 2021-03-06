var data = holidays;
var chart_meta = null;
var chart_data = null;
var max_days = 0;  
holidays.forEach(function(d,i){ if(max_days<d.total) max_days=d.total; });

var lang = d3.select('html').attr("lang");
if(!(lang == "ka" || lang == "en"))
{ 
  lang = "en";
  d3.select('html').attr("lang",lang);
}
var margin = {top: 60, right: 20, bottom: 30, left: 150},   
   width = 1020 - margin.left - margin.right,
   height = 960 - margin.top - margin.bottom,
   width_svg = 1250;

var x = d3.scale.linear().rangeRound([0, width]);
var y = d3.scale.ordinal().rangeRoundBands([height, 0],0);

var color = null; 
var klass = null;
var color_default = d3.scale.ordinal().range(['#5eddcc','#0ab5dd','#3286a0','#ff926f','#ccdee4']).domain([0,1,2,3,4]); 
var tip = d3.tip().direction('n').attr('class', 'd3-tip').offset([-10, 0]).html(function(d) { return d; });

var svg = d3.select("content").append("svg")
    .attr("width", width_svg)
    .attr("height", height + margin.top + margin.bottom)
  .append("g").attr('class','chart')
    .attr("transform", "translate(" + (margin.left) + "," + 40 + ")");

comment = comment[lang];

d3.select('.filter select').on('change',function(d){ sort(+this.options[this.selectedIndex].value); });

function init()
{     

  x.domain([0, max_days]);
  y.domain(data.map(function(d) { return d.country[lang]; }));

  chart_data = svg.append("g").attr("class","data");
  chart_meta = svg.append("g").attr("class","meta");

  chart_meta.append("g")         
    .attr("class", "x grid")
    .attr("transform", "translate(0," + height + ")")
    .call(axis_x()
        .tickSize(-height, 0, 0)
        .tickFormat("")
    );
   
  chart_meta.append("g").attr("class", "y grid").attr("transform", "translate(0,"+y.rangeBand()/2+")").call(axis_y().tickSize(-width, 0, 0).tickFormat(""));

  init_legend();
  sort();
}
function sort(v)
{
  // country = 0(default), total = 1, national = 2, y1 = 3, y2 = 4, y3 = 5\  
  if(!exist(v)) v = 0;
  switch(v) 
  {
    case 1:
      data.sort(function(a, b) { return a.total - b.total; }); break;
    case 2:
      data.sort(function(a, b) { 
        if(a.national === b.national) 
        {
          if(a.total === b.total)
            return b.country[lang].localeCompare(a.country[lang])
          else
            return a.total-b.total; 
        }
        return a.national - b.national;
      }); break;
    case 3:
      data.sort(function(a, b) { 
        if(a.y1 === b.y1) { 
           if(a.total === b.total)
            return b.country[lang].localeCompare(a.country[lang])
          else
            return a.total-b.total; 
        }
        return a.y1 - b.y1;
      }); break;    
    case 4:
      data.sort(function(a, b) { 
        if(a.y5 === b.y5) { 
          if(a.total === b.total)
            return b.country[lang].localeCompare(a.country[lang])
          else
            return a.total-b.total; 
        }
        return a.y5 - b.y5;
      }); break;
    case 5:
      data.sort(function(a, b) { 
        if(a.y10 === b.y10) { 
          if(a.total === b.total)
            return b.country[lang].localeCompare(a.country[lang])
          else
            return a.total-b.total; 
        }
        return a.y10 - b.y10;
      }); break;      
    default:
    data.sort(function(a, b) { return b.country[lang].localeCompare(a.country[lang]); }); break;
  }
  refresh_items(v);
  redraw();
}
function redraw()
{  

  svg.selectAll(".g.item").remove();
  chart_meta.select(".x.axis").remove();
  chart_meta.select(".y.axis").remove();

  y.domain(data.map(function(d) { return d.country[lang]; }));

  chart_meta.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(-12," + height + ")")
        .call(axis_x());

  chart_meta.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(-12,-23)")
        .call(axis_x());


  chart_meta.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(-10,0)")
      .call(axis_y()).on('mouseover',function(){console.log('asdfasdf');});   

  var state = chart_data.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "g item")
      .attr("transform", function(d) { return "translate(0," + y(d.country[lang]) + ")"; })
      .on('mouseover', function(d,i){ d3.select(this).classed('selected',true); tip.show(comment.replace('&country',d.country[lang]).replace('&y1',d.y1).replace('&y5',d.y1+d.y5).replace('&y10',d.y1+d.y5+d.y10).replace('&h',d.national).replace('&t',d.total)); })
      .on('mouseout', function(d,i){ d3.select(this).classed('selected',false); tip.hide(); });


   state.selectAll("rect")
      .data(function(d) { return d.items; })
    .enter().append("rect")
      .attr("height", y.rangeBand())
      .attr("x", function(d) { console.log(d);return x(d.y0);})
      .attr("width", function(d) { return x(d.y1) - x(d.y0); })      
      .attr('class', function(d,i) { return klass(i); });

   state.call(tip);
}
function axis_x() { return d3.svg.axis().scale(x).orient("bottom").tickValues(d3.range(1,max_days+1,1)).ticks(max_days).tickFormat(d3.format("d")); }
function axis_y() { return d3.svg.axis().scale(y).orient("left"); }
function init_legend()
{
  var l = legends.map(function(d){ return d.name[lang];});
  var legend = chart_meta
  .append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate(" + (width+15) + ", 0 )"; });
    
  var text = legend.append('text').attr({x:0,y:18});
    text.append('tspan').text(labels.legend_title[lang].split('&n')[0])
    text.append('tspan').attr({x:0,dy:18}).text(labels.legend_title[lang].split('&n')[1]);                  
    
  var items = legend
    .selectAll(".item")
    .data(l)
    .enter()
    .append('g')
    .attr("class", "item")
  .attr("transform", function(d, i) { return "translate(" + 0 + "," + (i*25 + 36)  + ")"; });

  items.append("rect").attr({y:16,width:16,height:16,rx:1,ry:1}).style("fill", color_default);
  items.append("text").attr("y",23).attr("x",25).attr("dy", ".35em").text(function(d) { return d; });

  legend.append('line').attr({ x1:"0", y1:"160", x2:"200", y2:"160",'fill':'none','stroke':'#8F9B9B','stroke-width':1,'stroke-miterlimit':10}).style({ opacity:0.6});

  legend.append("rect").attr({y:170,width:8,height:8,fill:'#3286a0',rx:1,ry:1});
  var text = legend.append('text').attr({x:15,y:179});

  text.append('tspan').text(labels.legend_comment1[lang].split('&n')[0]);
  text.append('tspan').attr({x:15,dy:18}).text(labels.legend_comment1[lang].split('&n')[1]);
  text.append('tspan').attr({x:15,dy:18}).text(labels.legend_comment1[lang].split('&n')[2]);
  text.append('tspan').attr({x:15,dy:18}).text(labels.legend_comment1[lang].split('&n')[3]);

  legend.append("rect").attr({y:260,width:8,height:8,fill:'#ff926f',rx:1,ry:1});
  var text = legend.append('text').attr({x:15,y:269});

  text.append('tspan').attr({x:15}).text(labels.legend_comment2[lang].split('&n')[0]);
  text.append('tspan').attr({x:15,dy:18}).text(labels.legend_comment2[lang].split('&n')[1]);

}

function refresh_items(v)
{
  data.forEach(function(d) {   
    d.items = [];  

    var colors = ['#5eddcc','#0ab5dd','#3286a0','#ff926f','#ccdee4'];
    var klasses = ['item-year1','item-year5','item-year10','item-national','item-empty'];
    var orders =  [0,1,2,3,4];
    var values = [d.y1,d.y5,d.y10,d.national,max_days-d.total]

    var ctmp = [];
    var ktmp = [];
    if(v == 2)      orders = [3,0,1,2,4];         
    else if(v == 4) orders = [1,2,0,3,4]; 
    else if(v == 5) orders = [2,1,0,3,4]; 

    var y0 = 0;    
    for(var i=0;i<5;++i)
    {
        d.items.push({y0: y0, y1: y0 += values[orders[i]]});
        ktmp.push(klasses[orders[i]]);
        ctmp.push(colors[orders[i]]);
    }
    color = d3.scale.ordinal().range(ctmp).domain([0,1,2,3,4]); 
    klass = d3.scale.ordinal().range(ktmp).domain([0,1,2,3,4]); 
  });
  
}
function exist(v) { return typeof v !== 'undefined' && v !== null && v !== ''; }
init();
define(function (require) {
  return function ChartTitleFactory(d3, Private) {
    var $ = require('jquery');
    var _ = require('lodash');

    function ChartTitle(el) {
      if (!(this instanceof ChartTitle)) {
        return new ChartTitle(el);
      }

      this.el = el;
    }

    ChartTitle.prototype.render = function () {
      d3.select(this.el).selectAll('.chart-title').call(this.draw());
      d3.select(this.el).selectAll('.chart-title').call(this.truncate());
    };

    ChartTitle.prototype.truncate = function () {
      return function (selection) {
        var dataType = selection[0].parentNode.__data__.rows ? 'rows' : 'columns';

        selection.each(function () {
          var div = d3.select(this);
          var text = div.select('text');
          var textLength = text.node().getComputedTextLength();
          var maxWidth = dataType === 'rows' ? $(this).height() : $(this).width();
          var subtractionPercentage = maxWidth * 0.05;
          var str = text.text();

          maxWidth = maxWidth - subtractionPercentage;
          if (textLength > maxWidth) {
            var avg = textLength / str.length;
            var end = Math.floor(maxWidth / avg);

            str = str.substr(0, end) + '...';
          }

          text.text(str);
        });
      };
    };
    
    ChartTitle.prototype.draw = function () {
      var self = this;

      return function (selection) {
        var dataType = selection[0].parentNode.__data__.rows ? 'rows' : 'columns';

        selection.each(function () {
          var div = d3.select(this);
          var width = $(this).width();
          var height = $(this).height();
          div.append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('text')
            .attr('transform', function () {
              if (dataType === 'rows') {
                return 'translate(11,' + height / 2 + ')rotate(270)';
              }
              return 'translate(' + width / 2 + ',11)';
            })
            .attr('text-anchor', 'middle')
            .text(function (d) {
              return d.label;
            });
        });
      };
    };

    return ChartTitle;
  };
});

const _ = require('lodash');
const Chart = require('chart.js');
const jQuery = require('jquery');

Chart.defaults.global.defaultFontColor = '#fff';

($ => {
  // inspired by <https://bootstrap-themes.github.io/dashboard/assets/js/toolkit.js>
  const charts = {
    line: el => {
      const $el = $(el);
      const data = _.clone($el.data());
      $el.removeData('datasets');
      $el.removeData('labels');
      $el.removeData('chart');
      const options = {
        responsive: true,
        legend: {
          display: false
        },
        tooltips: {
          mode: 'x-axis'
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false
              }
            }
          ],
          yAxes: [
            {
              gridLines: {
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }
          ]
        },
        scaleGridLineColor: 'rgba(0,0,0,.05)',
        scaleFontColor: 'rgba(0,0,0,.4)',
        scaleFontSize: 14,
        scaleLabel: t => t.value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'),
        animation: false,
        elements: {
          line: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderColor: '#fff'
          },
          point: {
            backgroundColor: '#fff',
            borderColor: '#fff'
          }
        }
      };
      // eslint-disable-next-line no-new
      new Chart.Line(el.getContext('2d'), { data, options });
    }
  };

  $(document)
    .on('redraw-charts', () => {
      $('[data-chart]').each(function() {
        if ($(this).is(':visible')) charts[$(this).attr('data-chart')](this);
      });
    })
    .trigger('redraw-charts');
})(jQuery);

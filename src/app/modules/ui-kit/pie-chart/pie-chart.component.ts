import { Component, Input, OnChanges } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnChanges {

  /**
   * Bindings
   */
  @Input() properties: any;

  constructor() { }

  ngOnChanges(): void {
    setTimeout(() => {
      this.loadPieChart();
    }, 0);
  }

  /**
   * Load pie chart
   */
  loadPieChart(): void {
    const chart = this.properties && this.properties.length ? this.properties[0] : {};
    if (chart && Object.keys(chart).length) {
      const canvas: any = document.getElementById(chart.id);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        // tslint:disable-next-line:no-unused-expression
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: chart.labels,
            datasets: [{
              backgroundColor: chart.backgroundColor,
              data: chart.data
            }]
          },
          options: {
            responsive: true,
            legend: {
              display: false,
              labels: {
                fontFamily: 'stolzl regular'
              }
            },
            /**
             * Custom tooltip UI
             */
            tooltips: {
              enabled: false,
              custom(tooltip: any) {
                const tooltipEl = this._chart.canvas.nextElementSibling;
                if (!tooltip) {
                  return (tooltipEl.style.display = 'none');
                }
                if (tooltip.body && tooltip.body.length) {
                  const fullText = tooltip.body[0].lines[0];
                  const text = fullText.split(':')[0];
                  if (text) {
                    const val = fullText.split(':')[1];
                    tooltipEl.innerHTML = `<div class="custom-tooltip"><p>${text}:<span> ${val}</span></p></div>`;

                    tooltipEl.style.display = 'inline-block';
                    tooltipEl.style.position = 'absolute';
                    tooltipEl.style.pointerEvents = 'none';
                    tooltipEl.style.zIndex = '9';
                  } else {
                    tooltipEl.style.display = 'none';
                  }
                } else {
                  tooltipEl.style.display = 'none';
                }
              }
            }
          }
        });
      }
    }
  }
}

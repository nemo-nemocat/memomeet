import React from 'react';
import { HorizontalBar } from 'react-chartjs-2';

const data = {
    labels: ['이다해', '박혜린', '김하연', '유효민'],
    datasets: [
        {
            backgroundColor: '#ffd859',
            borderColor: '#ffc31e',
            borderWidth: 1,
            hoverBackgroundColor: '#ffc31e',
            hoverBorderColor: '#ffc31e',
            data: [25, 15, 20, 23]
        }
    ]
};

const options = {
    legend: {
        display: false,
    },
    scales: {
        xAxes: [{
            display: false,
            ticks: {
                min: 0,
                max: 30,
            },
            gridLines: {
                display: false,
            }
        }],
        yAxes: [{
            barPercentage: 0.6,
        }]
    },
    maintainAspectRatio: false,
};

export default function Chart(prop) {

    return(
        <div>
            <HorizontalBar data={data} options={options} height={125} width={300} />
        </div>
    );
}
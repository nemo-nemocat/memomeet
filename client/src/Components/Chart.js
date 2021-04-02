import React, {useEffect, useState} from 'react';
import { HorizontalBar } from 'react-chartjs-2';

export default function Chart(prop) {
    var tempList = [];
    const [nameList, setNameList] = useState([]);
    //const [profile, setProfile] = useState([]);
    const contributionList = prop.contribution.split(" ");

    useEffect(() => {
        prop.userData.forEach(element => {
            tempList.push(element.user_name);
        })
        setNameList(tempList);
    }, [prop]);

    const data = {
        labels: nameList,
        datasets: [
            {
                backgroundColor: '#ffd859',
                borderColor: '#ffc31e',
                borderWidth: 1,
                hoverBackgroundColor: '#ffc31e',
                hoverBorderColor: '#ffc31e',
                data: contributionList
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
                    max: 100
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

    return(
        <div>
            <HorizontalBar data={data} options={options} height={125} width={300} />
        </div>
    );
}
import { Viewer, Heatmap, InteractiveClippingPlane, ConstantColorChannel, ContinuousHeatmapChannel, ValueRange, ValueRangesHeatmapChannel, HeatmapSource, Icons, CameraType, ViewType, ClippingPlane, ProductType, IHeatmapChannel, ChannelType, RenderingMode, DiscreteHeatmapChannel, } from '../..';
import { Icon } from '../../src/plugins/DataVisualization/Icons/icon';
import { IconsData } from './icons';

const viewer = new Viewer("viewer");
const heatmap = new Heatmap();
const icons = new Icons();
viewer.addPlugin(heatmap);
viewer.addPlugin(icons);

var plane = new InteractiveClippingPlane();
viewer.addPlugin(plane);


const tempChannelId = "room_temp";
const humidityChannelId = "room_humidity";
const energyChannelId = "room_energy";
const occChannelId = "room_occupancy";

const products = [{ id: 152, model: 1 }, { id: 447, model: 1 }];
const energySource = new HeatmapSource("Energy sensor", products, energyChannelId, 10);
const temperatureSource = new HeatmapSource("Temp sensor", products, tempChannelId, 22);
const humiditySource = new HeatmapSource("Humidity sensor", products, humidityChannelId, 10);
const occupancySource = new HeatmapSource("Occupancy sensor", products, occChannelId, "Occupied");

const sourceIcon = new Icon("Rooms 1 and 2 Sensor", "Temperature sensor", "22°C", products, IconsData.errorIcon, null, null, null, () => { 
    viewer.zoomTo(products, 1) });
const otherIcon = new Icon("Temperature Sensor 2", "Temperature sensor", "22°C", [{id: 617, model: 1}], IconsData.successIcon);

let selectedChannel: IHeatmapChannel;
const ranges = [
    new ValueRange(-Infinity, 5, "#00d4ff", "Exteremly Cold", 2),
    new ValueRange(5, 17, "#3d00f7", "Cold", 1),
    new ValueRange(17, 25, "#41ff0c", "Good", 0),
    new ValueRange(25, 32, "#ff9999", "Hot", 1),
    new ValueRange(32, Infinity, "#ff0000", "Extremely Hot", 2)
];
const tempChannel = new ValueRangesHeatmapChannel
(tempChannelId, "double", "Temperature", "Temperature of Rooms", "temperature", "°C", ranges);

const humidityChannel = new ContinuousHeatmapChannel
(humidityChannelId, "double", "Humidity", "Humidity of Rooms", "humidity", "%", 0, 100, ["#1ac603", "#f96c00"]);

const energyChannel = new ConstantColorChannel
(energyChannelId, "double", "Energy", "Energy Consumption", "energy", "kW", "#1ac603");

const occupancyChannel = new DiscreteHeatmapChannel
(occChannelId, "string", "Occupancy", "Room Occupancy", "occupancy", "", {
    "Occupied": "#ff0000",
    "Vacant": "#00ff00"
});


selectedChannel = tempChannel;

heatmap.addChannel(tempChannel);
heatmap.addChannel(humidityChannel);
heatmap.addChannel(energyChannel);
heatmap.addChannel(occupancyChannel);

viewer.on('loaded', args => {
    try {
        
        viewer.camera = CameraType.PERSPECTIVE;
        viewer.resetState(ProductType.IFCSPACE)
        viewer.show(ViewType.DEFAULT);
        viewer.renderingMode = RenderingMode.XRAY_ULTRA;

        heatmap.addSource(temperatureSource);
        heatmap.addSource(humiditySource);
        heatmap.addSource(energySource);
        heatmap.addSource(occupancySource);

        icons.addIcon(sourceIcon);
        icons.addIcon(otherIcon);
        // icons.addIcon(new Icon("Temperature Sensor 3", "Temperature sensor", 1, [447], IconsData.successIcon));

        heatmap.renderChannel(selectedChannel.channelId);

        setInterval(function(){
            if(selectedChannel.channelId === tempChannelId){
                temperatureSource.value = getRandomInt(40).toString(); // will work for stringified
                heatmap.renderSource(temperatureSource.id);
                sourceIcon.description = `Room ${selectedChannel.name}: ${temperatureSource.value}${selectedChannel.unit}`;
                sourceIcon.valueReadout = `${temperatureSource.value}${selectedChannel.unit}`;
                otherIcon.valueReadout = `22${selectedChannel.unit}`;
            }
            else if(selectedChannel.channelId === humidityChannelId){
                humiditySource.value = getRandomInt(100).toString();
                heatmap.renderSource(humiditySource.id);
                sourceIcon.description = `Room ${selectedChannel.name}: ${humiditySource.value}${selectedChannel.unit}`;
                sourceIcon.valueReadout = `${humiditySource.value}${selectedChannel.unit}`;
                otherIcon.valueReadout = `10${selectedChannel.unit}`;
            }
            else if(selectedChannel.channelId === energyChannelId){
                energySource.value = getRandomInt(100).toString();
                heatmap.renderSource(energySource.id);
                sourceIcon.description = `${selectedChannel.description}: ${energySource.value}${selectedChannel.unit}`;
                sourceIcon.valueReadout = `${energySource.value}${selectedChannel.unit}`;
                otherIcon.valueReadout = `20${selectedChannel.unit}`;
            }
            else if(selectedChannel.channelId === occChannelId){
                occupancySource.value = occupancySource.value.toLowerCase() === "occupied" ? "vacant" : "occupied";
                heatmap.renderSource(occupancySource.id);
                sourceIcon.description = `${selectedChannel.description}: ${occupancySource.value}`;
                sourceIcon.valueReadout = `${occupancySource.value}`;
                otherIcon.valueReadout = `N/A`;
            }
            
        }, 2000);

    } catch (e) {

    }
});

viewer.on("pick", (arg) => {
    console.log(`Product id: ${arg.id}, model: ${arg.model}`)
});


const channelsDropdown = document.getElementById('channels') as HTMLSelectElement;
channelsDropdown.addEventListener('change', handleDropdownChange);

heatmap.channels.forEach(obj => {
    const option = document.createElement('option');
    option.value = obj.name;
    option.textContent = obj.description;
    channelsDropdown.appendChild(option);
});

setSelectedChannel();

viewer.loadAsync('/tests/data/SampleHouse.wexbim')
viewer.hoverPickEnabled = true;
viewer.adaptivePerformanceOn = false;
viewer.highlightingColour = [0, 0, 255, 255];
viewer.start();
window['viewer'] = viewer;


function setSelectedChannel() {
    if(selectedChannel.channelType === ChannelType.Continuous){
        const rangesElement = document.getElementById('ranges')!;
        rangesElement.style.display = "none";
        const continous = selectedChannel as ContinuousHeatmapChannel;
        const colors = continous.colorGradient;
        const gradientElement = document.getElementById('gradient')!;
        const gradientParentElement = document.getElementById('gradient-parent')!;
        gradientParentElement.style.display = "flex";

        const gradientStartElement = document.getElementById('start-grad')!;
        const gradientEndElement = document.getElementById('end-grad')!;
        gradientStartElement.textContent = `${continous.min}${selectedChannel.unit}`;
        gradientEndElement.textContent = `${continous.max}${selectedChannel.unit}`;

        const numColors = colors.length;
        const stops = colors.map((color, index) => {
            const position = (index / (numColors - 1)) * 100;
            return { color, position: `${position}%` };
        });
        const gradientString = stops.map(stop => `${stop.color} ${stop.position}`).join(', ');
        gradientElement.style.background = `linear-gradient(90deg, ${gradientString})`;
    }
    else if(selectedChannel.channelType === ChannelType.ValueRanges){
        const gradientElement = document.getElementById('gradient-parent')!;
        gradientElement.style.display = "none";
        const valueRanges = selectedChannel as ValueRangesHeatmapChannel;

        const container = document.getElementById('ranges')!;
        container.style.display = "flex";
        container.innerHTML  = "";
        valueRanges.valueRanges.forEach(range => {
            const rangeDiv = document.createElement('div');
            rangeDiv.style.backgroundColor = range.color;
            rangeDiv.textContent = `${range.label} (${range.min === -Infinity ? '-∞' : range.min}${valueRanges.unit} to ${range.max === Infinity ? '∞' : range.max}${valueRanges.unit})`;
            container.appendChild(rangeDiv);
        });

    } else if(selectedChannel.channelType === ChannelType.Constant){
        const gradientElement = document.getElementById('gradient-parent')!;
        gradientElement.style.display = "none";
        const container = document.getElementById('ranges')!;
        container.style.display = "none";
    }
    
}

function handleDropdownChange() {
    const selectedChannelName = channelsDropdown.value;
    switch(selectedChannelName){
        case 'Humidity':{
            selectedChannel = humidityChannel;
            setSelectedChannel();
            return;
        }
        case 'Temperature':{
            selectedChannel = tempChannel;
            setSelectedChannel();
            return;
        }
        case 'Energy':{
            selectedChannel = energyChannel;
            setSelectedChannel();
            return;
        }
        case 'Occupancy':{
            selectedChannel = occupancyChannel;
            setSelectedChannel();
            return;
        }
    }
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}


let clipModel = () => {
    var planes: ClippingPlane[] = [
        {
            direction: [1, 0, 0],
            location: [10000, 0, 0]
        },
        {
            direction: [0, 1, 0],
            location: [0, 10000, 0]
        },
        {
            direction: [0, 0, 1],
            location: [0, 0, 2000]
        },
        {
            direction: [-1, 0, 0],
            location: [-10000, 0, 0]
        },
        {
            direction: [0, -1, 0],
            location: [0, -10000, 0]
        },
        {
            direction: [0, 0, -1],
            location: [0, 0, -10000]
        }
    ];

    viewer.sectionBox.setToPlanes(planes);
}

document['clip'] = () => {
    plane.stopped = false;
};
document['hideClippingControl'] = () => {
    plane.stopped = true;
};
document['unclip'] = () => {
    viewer.unclip();
    plane.stopped = true;
};

window['clipBox'] = () => {
    var planes: ClippingPlane[] = [
        {
            direction: [1, 0, 0],
            location: [5000, 0, 0]
        },
        {
            direction: [0, 1, 0],
            location: [0, 2000, 0]
        },
        {
            direction: [0, 0, 1],
            location: [0, 0, 2100]
        },
        {
            direction: [-1, 0, 0],
            location: [-100, 0, 0]
        },
        {
            direction: [0, -1, 0],
            location: [0, -2000, 0]
        },
        {
            direction: [0, 0, -1],
            location: [0, 0, -1000]
        }
    ];

    viewer.sectionBox.setToPlanes(planes);
    viewer.zoomTo();
};

window['releaseClipBox'] = () => {
    clipModel();
    viewer.zoomTo();
};

import { createSignal, onCleanup, Show } from 'solid-js';
import mqtt from 'mqtt';
import LineChart from '../Components/LineChart/LineChart.jsx';

import './MainScreen.css';

interface ConnectionConfig {
    port?: string,
    connectionString: string,
    username?: string,
    password?: string,
    topic: string
}

interface mqttMessage {
    timestamp: number,
    coolantTemp?: number,
    damperTravel?: number,
    wheelTravel?: number,
    fuelLevel?: number
}

export default function MainScreen() {
    const canvasProperties = ["coolantTemp", "damperTravel", "wheelTravel"];

    const [connectionConf, setConnectionConf] = createSignal<ConnectionConfig>({
        port: '',
        connectionString: '',
        username: '',
        password: '',
        topic: ''
    });

    const [streamingData, setStreamingData] = createSignal<mqttMessage[]>([{
        timestamp: new Date().getTime(),
        coolantTemp: undefined,
        damperTravel: undefined,
        wheelTravel: undefined,
        fuelLevel: undefined
    }]);

    const [logData, setLogData] = createSignal<mqttMessage[]>([{
        timestamp: new Date().getTime(),
        coolantTemp: undefined,
        damperTravel: undefined,
        wheelTravel: undefined,
        fuelLevel: undefined
    }]);
    const [isConnected, setIsConnected] = createSignal(false);

    const handleInput = (key: keyof ConnectionConfig) => (e: Event) => {
        setConnectionConf((prev) => ({ ...prev, [key]: (e.target as HTMLInputElement).value }));
    };

    async function connect(e: Event) {
        e.preventDefault(); //Prevents default behaviour of reloading the page when submitting form
        console.log(connectionConf());

        const client = mqtt.connect(`ws://${connectionConf().connectionString}:${connectionConf().port}/mqtt`)

        client.on('connect', () => {
            console.log('Connected to MQTT broker');
            client.subscribe(connectionConf().topic);
            setIsConnected(true);
        });

        client.on('message', (topic, message) => {
            const jsonData = JSON.parse(message.toString());

            const newDataPoint = {
                timestamp: new Date().getTime(),
                coolantTemp: jsonData.coolantTemp,
                damperTravel: jsonData.damperTravel,
                wheelTravel: jsonData.wheelTravel,
                fuelLevel: jsonData.fuelLevel
            };

            setStreamingData((prev) => [...prev, newDataPoint]);
        });

        client.on('error', (error) => {
            console.error('MQTT connection error:', error);
            setIsConnected(false);
        });


    }

    onCleanup(() => {
        //onCleanup
    });

    return (
        <div id='container'>
            <Show when={isConnected()}
                fallback={
                    <div class='containerForm'>
                        <form onsubmit={connect}>
                            <div class='inputSet'>
                                <label for='connectionString'><span class='requiredSpan'>*</span> Broker Connection String</label>
                                <input
                                    type='text'
                                    id='connectionString'
                                    value={connectionConf().connectionString}
                                    onInput={handleInput('connectionString')}
                                    placeholder='Enter MQTT Broker Address'
                                >
                                </input>
                            </div>
                            <div class='inputSet'>
                                <label for='clientName'><span class='requiredSpan'>*</span> Port</label>
                                <input
                                    type='text'
                                    id='clientName'
                                    value={connectionConf().port}
                                    onInput={handleInput('port')}
                                    placeholder='Enter Port'
                                >
                                </input>
                            </div>
                            <div class='inputSet'>
                                <label for='username'>Username</label>
                                <input
                                    type='text'
                                    id='username'
                                    value={connectionConf().username}
                                    onInput={handleInput('username')}
                                    placeholder='Enter Username'
                                >
                                </input>
                            </div>
                            <div class='inputSet'>
                                <label for='password'>Password</label>
                                <input
                                    type='password'
                                    id='password'
                                    value={connectionConf().password}
                                    onInput={handleInput('password')}
                                    placeholder='Enter Password'
                                >
                                </input>
                            </div>
                            <div class='inputSet'>
                                <label for='topic'><span class='requiredSpan'>*</span> Topic</label>
                                <input
                                    type='text'
                                    id='topic'
                                    value={connectionConf().topic}
                                    onInput={handleInput('topic')}
                                    placeholder='Enter Topic'
                                >
                                </input>
                            </div>
                            <button type='submit'>Connect</button>
                            <img src='/SR_White.png' alt='Logo' class='SRLogo' />
                        </form>
                    </div>
                }>
                <div class='containerChart'>
                    {canvasProperties.map((property) => (
                        <LineChart property={property} data={streamingData} class='lineChart' />
                    ))}
                </div>
            </Show>

        </div>
    )
}
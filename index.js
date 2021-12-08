// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require('venom-bot');
const fetch = require('node-fetch');


let fase = 0;
let datos = [];
let nombre = '';
let telefono = '';

venom
    .create({
        session: 'jira-bot', //name of session
        multidevice: false // for version not multidevice use false.(default: true)
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

function start(client) {

    client.onMessage((message) => {

        telefono = message.sender.id;
        nombre = message.sender.pushname;
        datos.push(message.body);
        
        switch (fase) {
            case 0:
                client
                    .sendText(message.from, `Hola 👋, bienvenido al soporte de JIRA. Vamos a crear un ticket, ¿Me puedes facilitar un resumen para el ticket?`)
                    .then((result) => {
                        //console.log('Result: ', result); //return object success
                        fase = 1;
                    })
                    .catch((erro) => {
                        console.error('Error when sending: ', erro); //return object error
                    });
                break;
            case 1:
                client
                    .sendText(message.from, `Vale. ¿Me puedes facilitar algo más de información? 💬`)
                    .then((result) => {
                        //console.log('Result: ', result); //return object success
                        fase = 2;
                    })
                    .catch((erro) => {
                        console.error('Error when sending: ', erro); //return object error
                    });
                break;
            case 2:
                const buttons = [
                    {
                        "buttonText": {
                            "displayText": "CAU"
                        }
                    },
                    {
                        "buttonText": {
                            "displayText": "GESTIC"
                        }
                    }
                ]
                client.sendButtons(message.from, 'Proyectos', buttons, 'Selecciona uno')
                    .then((result) => {
                        //console.log('Result2: ', result); //return object success
                        fase = 3;
                    })
                    .catch((erro) => {
                        console.error('Error when sending: ', erro); //return object error
                    });
                break;

            case 3:

                const list = [
                    {
                        title: "Tipo de tareas",
                        rows: [
                            {
                                title: "Incidencia",
                                description: "Si tiene un problema o un error.",
                            },
                            {
                                title: "Consulta",
                                description: "Si tiene dudas o necesita información sobre un asunto",
                            },
                            {
                                title: "Servicio",
                                description: "Si necesita de nuestro soporte de servicios.",
                            }
                        ]
                    }
                ];

                client.sendListMenu(message.from, 'Tipo de tarea', 'Seleccione uno', 'Para clasificar este ticket necesitamos saber de que tipo se trata', 'opciones', list)
                    .then((result) => {
                        // console.log('Result: ', result); //return object success
                        fase = 4;
                    })
                    .catch((erro) => {
                        console.error('Error when sending: ', erro); //return object error
                    });
                break;
            case 4:
               
                const msg = [
                    {
                        "buttonText": {
                            "displayText": "Vale 👍"
                        }
                    }
                ]
                client.sendButtons(message.from, 'Gracias por facilitarnos la información, vamos a proceder a crear el ticket, ¿de acuerdo?', msg, 'Pulse el botón para finalizar')
                    .then((result) => {
                        //console.log('Result2: ', result); //return object success
                        fase = -1;
                    })
                    .catch((erro) => {
                        console.error('Error when sending: ', erro); //return object error
                    });

                break;
            default:

                const issue =
                    `{
                                "update": {},
                                "fields": {
                                "summary":  "${datos[1]}",
                                "issuetype": {
                                    "name": "${datos[4].substring(0, datos[4].indexOf('\n'))}"
                                },
                                "project": {
                                    "key": "${datos[3]}"
                                },
                                "description": {
                                    "type": "doc",
                                    "version": 1,
                                    "content": [
                                    {
                                        "type": "paragraph",
                                        "content": [
                                        {
                                            "text": "${datos[2]}",
                                            "type": "text"
                                        }
                                        ]
                                    }
                                    ]
                                },
                                "reporter": {
                                    "id": "5d0a2b3cdae4be0bc931c579"
                                },
                                    "customfield_10058": "${telefono.substring(2, 11)}",
                                    "customfield_10057":  "${nombre}"
                                }
                            }`
                    ;

                fetch('https://chatsbot.atlassian.net/rest/api/3/issue', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${Buffer.from(
                            'tamara.96mc@gmail.com:8vGj0T113pJGuUv4LPJi5676'
                        ).toString('base64')}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: issue
                })
                .then(response => {
                    console.log(
                      `Response: ${response.status} ${response.statusText}`
                    );
                    return response.text();
                  })
                .then(text => {

                    let datos = JSON.parse(text);
                    client
                            .sendText(message.from, `Hemos creado en ticket 📝 ${datos.key}, puede consultarlo en ➡ https://chatsbot.atlassian.net/browse/${datos.key}`)
                            .then((result) => {
                                fase = 0;
                            })
                            .catch((erro) => {
                                console.error('Error when sending: ', erro); //return object error
                            });
                })
                .catch(err => console.error(err));
                break;
        }

    });

}
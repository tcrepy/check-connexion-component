# Web Component - Check Connexion

## Installation

run this in your work directory

```
npm i wcomponent-check-connexion
```

include the package with in html files :

```html
<script src="path/to/connexion.js" async></script>
```

or in js files :

```js
import CheckConnexion from "./path/to/Connexion";
```

    
## Use 

add `<check-connexion></check-connexion>` anywhere in your html file. 

This web component allow your users to know if they are connected to internet with a message, and the application can catch an event called `connexion-changed` fired in `document` to check user's connexion.

The event can be catch with something like that : 

```js
document.addEventListener('connexion-changed', ({detail}) => {
    //detail contains a bool wich is indicating the state of the connexion
    //do wathever you want with it
})
```

there is some parameters you can add : 

- `timeToCount`: number (3), the number of test you'll make before deciding your user have a slow connexion,
- `threshold`: number (2000), max duration (ms) for the average of test's duration,
- `offlineTimeout`: number (2000), duration (ms) before the application pass offline,
- `message`: text ("Disconnected"), the message you want to display when the app is offline,
- `intervalCheckLatency`: number (6000), the interval (ms) between each connexion test

example: 

```html
<check-connexion 
    timeToCount="5" 
    threshold="1000" 
    offlineTimeout="1000" 
    message="You aren't connected" 
    intervalCheckLatency="2000"
>
</check-connexion>
```
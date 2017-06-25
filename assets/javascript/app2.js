$(document).ready(function() {
  var config = {
    apiKey: "AIzaSyBOGAOOQKw2O5IBq62iqMTBieWKamgjAfo",
    authDomain: "trainschedule-af851.firebaseapp.com",
    databaseURL: "https://trainschedule-af851.firebaseio.com",
    projectId: "trainschedule-af851",
    storageBucket: "trainschedule-af851.appspot.com",
    messagingSenderId: "974739846874"
  };
  firebase.initializeApp(config);
  var currentTime;
  var timeToArrival;
  const database = firebase.database();
  const trains = database.ref('trains');
  function calculateNextArrival(firstArrival, frequency, trainId){
    const trainRef = trains + '/' + trainId;
    let deleteTrain = function() {
      trains.child(trainId).remove();
    }
    // console.log(' WHAT IS OUR TRAIN REFFFF', trainRef);
    let initialArrival = moment(firstArrival, ['HH:mm '])
    let nextArrival = moment(initialArrival).add(frequency, 'm')
    let minAway = calculateMinAway(nextArrival, deleteTrain);
    console.log(' WHAT IS THE NEXT ARRIVAL', minAway);
    return minAway
  }
  function calculateMinAway(nextArrival, cb) {
    let currentTime = moment();
    let arrival = moment(nextArrival);
    let timeToTrainArrival = currentTime.to(arrival);
    let diff = arrival.diff(currentTime);
    console.log(' WHAT IS THE TESTTTTTTTTT', diff);
    // console.log(' WHAT IS THE CURRENT TIME', timeToTrainArrival, currentTime, arrival );
    if (diff <= 0) {
      cb();
      alert(' Train Has arrived');
    }
    return timeToTrainArrival;
  }
  function formatTime(time) {
    var parsedTime = moment(time, ['hh:mm a']).format("hh:mm a");
    return parsedTime;
  }
  timeToArrival = setInterval(function() {
    // console.log(' RUNNING INTERVAL@');
    // calculateNextArrival(currentTime)
    trains.once('value', function(snapshot) {
      snapshot.forEach(function(childSnap) {
        var train = childSnap.val();
        let trainId = childSnap.key;
        let test = $('tbody').children().each(function(index,childEl) {
          // console.log(' WHAT IS THE TEST', $(childEl).find('.trainName').attr('data-trainname'));
          // var currentTrain = $(childEl).children();
          let trainNames = $(childEl).find('.trainName').attr('data-trainname');
          let nextArrivalTime = $(childEl).find('.minutesAway');
          let initialArrival = moment(train.initialTrainTime, ['HH:mm']).format("HH:mm ")
          if (train.trainName === trainNames) {
            let nextTrainStops = calculateNextArrival(initialArrival, train.frequency, trainId)
            console.log(' WAHT IS OUR CHIILD SNAP', nextTrainStops, );
            $(nextArrivalTime).text(nextTrainStops)
          }
        })
      })
    })
  }, 1000);
  function writeTrainData(data) {
    const { trainName, destination, initialTrainTime, frequency } = data
    const newPostRef = trains.push();
    const initialStartTime = moment(initialTrainTime, ['HH:mm']).format("HH:mm ");
    // console.log(' WHAT IS THE INITIAL START TIME', initialStartTime);
    newPostRef.set({
      trainName: trainName,
      destination: destination,
      frequency: frequency,
      initialTrainTime: initialStartTime,
    });
}
function createNewTableRow(data) {
const { trainName, destination, initialTrainTime, frequency } = data
let parsedTime = formatTime(initialTrainTime);
const trainData = `
  <tr class="trainInfo">
    <td class="trainName" data-trainname="${data.trainName}">${data.trainName}</td>
    <td class="destination">${data.destination}</td>
    <td class="frequency">${data.frequency} min</td>
    <td class="nextArrival">${parsedTime}</td>
    <td class="minutesAway">${frequency}</td>
  </tr>`
 return trainData;
}
// (function initializeTrainSchedule(){
//   trains.once('value', function(snapshot) {
//     // var data = snapshot.val();
//     snapshot.forEach(function(childSnapshot) {
//       var data = childSnapshot.val();
//       let initialTable = createNewTableRow(data);
//       $('#trainTable tbody').append(initialTable);
//     });
//   });
// })();
(function listenForTrainAdded() {
  trains.on('child_added', function(snapshot) {
    console.log(' DO WE GET A CHILD ADD FIRE ', snapshot.val());
    let initialTable = createNewTableRow(snapshot.val());
    $('#trainTable tbody').append(initialTable);
  })
})();
(function listenForTrainRemoved() {
  trains.on('child_removed', function(snapshot) {
    console.log(' CHILD REMOVED FIRE!!!!', snapshot.val(), snapshot.key);
    let trainToRemove = snapshot.val().trainName;
    $('.trainInfo').children().each(function(index, value) {
      console.log(' CAN WE GET OUR CHILDREN CHAINED ON EACH', index, value);
      let trainEl = $(value).attr('data-trainname');
      if (trainEl === trainToRemove) {
        $(value).parent('.trainInfo').remove();
      }
    })
  });
})();
$('form').submit(function(e) {
  e.preventDefault();
  var $inputs = $('#trainFormEntry :input:not(:button)');
  var values = {};
  $inputs.each(function() {
    var id = $(this)[0].id;
    values[id] = $(this).val();
    $(this).val('');
  });
  writeTrainData(values);
});
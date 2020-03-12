if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js')
        .then(function() {
            return navigator.serviceWorker.ready
        })
        .then(function(registration) {
            document.getElementById('submitForm').addEventListener('click', (event) => {
                event.preventDefault();
                if (navigator.onLine) {
                  console.log("online")
                  sendDataOnline()
                  return
                }
                saveData().then(function() {
                    if(registration.sync) {
                        registration.sync.register('example-sync')
                        .catch(function(err) {
                            console.log("Failed to sync")
                            return err;
                        })
                    } else {
                        // sync isn't there so fallback
                      console.log("sync not found")
                        checkInternet();
                    }
                });
            })
        })
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
}

initializeDB();
checkIndexedDB();

function checkIndexedDB() {
    if(navigator.onLine) {
        var newsletterDB = window.indexedDB.open('newsletterSignup');
        newsletterDB.onsuccess = function(event) {
            this.result.transaction("newsletterObjStore").objectStore("newsletterObjStore").getAll().onsuccess = function(event) {
                window.fetch('https://www.mocky.io/v2/5c0452da3300005100d01d1f', {
                        method: 'POST',
                        body: JSON.stringify(event.target.result),
                        headers:{
                          'Content-Type': 'application/json'
                        }
                    }).then(function(rez) {
                        console.log("fetching")
                        return rez.text();
                    }).then(function(response) {
                        newsletterDB.result.transaction("newsletterObjStore", "readwrite")
                        .objectStore("newsletterObjStore")
                        .clear();
                    }).catch(function(err) {
                        console.log('err ', err);
                    })
            };
        };
    }
}

function initializeDB() {
    var newsletterDB = window.indexedDB.open('newsletterSignup');

    console.log("Initializing db");
    newsletterDB.onupgradeneeded = function(event) {
        var db = event.target.result;

        var newsletterObjStore = db.createObjectStore("newsletterObjStore", { autoIncrement: true });
        newsletterObjStore.createIndex("firstName", "firstName", { unique: false });
        newsletterObjStore.createIndex("lastName", "lastName", { unique: false });
        newsletterObjStore.createIndex("email", "email", { unique: true });
        newsletterObjStore.createIndex("dateAdded", "dateAdded", { unique: true });
    }
}

function saveData() {
    return new Promise(function(resolve, reject) {
        var tmpObj = {
            firstName: document.getElementById('firstname').value,
            lastName: document.getElementById('lastname').value,
            email: document.getElementById('email').value,
            dateAdded: new Date()
        };
        clearInnerText()
    
        var myDB = window.indexedDB.open('newsletterSignup');
        console.log("saving")
    
        myDB.onsuccess = function(event) {
          console.log("sucessfully saved")
          var objStore = this.result.transaction('newsletterObjStore', 'readwrite').objectStore('newsletterObjStore');
          objStore.add(tmpObj);
          resolve();
        }

        myDB.onerror = function(err) {
            reject(err);
        }
    })
}

function fetchData() {
    return new Promise(function(resolve, reject) {
        var myDB = window.indexedDB.open('newsletterSignup');

        myDB.onsuccess = function(event) {
            this.result.transaction("newsletterObjStore").objectStore("newsletterObjStore").getAll().onsuccess = function(event) {
                resolve(event.target.result);
            };
        };

        myDB.onerror = function(err) {
            reject(err);
        }
    })
}

function sendData() {
    fetchData().then(function(response) {
      console.log("in send data", response)
        var postObj = {
            method: 'POST',
            body: JSON.stringify(response),
            headers:{
              'Content-Type': 'application/json'
            }
        };
        alert("Sending saved data: " + postObj.body)
    
        // send request
        return window.fetch('https://www.mocky.io/v2/5c0452da3300005100d01d1f', postObj)
    })
    .then(clearData)
    .catch(function(err) {
        console.log(err);
    });
}

function sendDataOnline() {
    var tmpObj = {
        firstName: document.getElementById('firstname').value,
        lastName: document.getElementById('lastname').value,
        email: document.getElementById('email').value,
        dateAdded: new Date()
    };
    clearInnerText()
    var postObj = {
        method: 'POST',
        body: JSON.stringify(tmpObj),
        headers:{
          'Content-Type': 'application/json'
        }
    }

    // send request
    return window.fetch('https://www.mocky.io/v2/5c0452da3300005100d01d1f', postObj)
    .then(clearData)
    .catch(function(err) {
        console.log(err);
    });
}

function clearData() {
    return new Promise(function(resolve, reject) {
        var request = window.indexedDB.open('newsletterSignup');

      request.onsuccess = function(event) {
        db =request.result;
        var transaction = db.transaction(["newsletterObjStore"], "readwrite")
        var objectStore = transaction.objectStore("newsletterObjStore")
        objectStore.clear()
      }

        request.onerror = function(err) {
            reject(err);
        }
    })
}

function checkInternet() {
    event.preventDefault();
    if(navigator.onLine) {
        sendData();
    } else {
        alert("You are offline! When your internet returns, we'll finish up your request.");
    }
}

window.addEventListener('online', function() {
    alert("You are online")
    if(navigator.serviceWorker) {
        fetchData().then(function(response) {
          console.log(response)
            if(response.length > 0) {
                return sendData();
            }
        });
    }
});

window.addEventListener('offline', function() {
    alert('You have lost internet access!');
});

function clearInnerText() {
  document.getElementById("formteammates").reset()
}

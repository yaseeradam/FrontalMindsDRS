// Script to clear all localStorage data and force regeneration
// Run this in browser console to clear data

if (typeof window !== 'undefined') {
    // Clear all stored data
    localStorage.removeItem('cases');
    localStorage.removeItem('arrests');
    localStorage.removeItem('patrols');
    localStorage.removeItem('evidence');
    localStorage.removeItem('transfers');
    
    console.log('All data cleared! Refresh the page to regenerate with new images.');
} else {
    console.log('This script should be run in a browser environment.');
}

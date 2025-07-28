// Typing animation function with cursor
function typeWriter(element, text, speed = 100) {
    return new Promise((resolve) => {
        let i = 0;
        element.innerHTML = '';
        element.classList.add('typing-cursor');
        
        function type() {
            if (i < text.length) {
                element.innerHTML = text.substring(0, i + 1);
                i++;
                setTimeout(type, speed);
            } else {
                // Remove cursor after typing is complete
                setTimeout(() => {
                    element.classList.remove('typing-cursor');
                    resolve();
                }, 500);
            }
        }
        
        type();
    });
}

// Function to animate multiple elements in sequence
async function animateTexts() {
    
    const mindBridgeElement = document.querySelector('.design_text');
    const mentalHealthElements = document.querySelectorAll('.moto span');
    
    const mindBridgeText = 'MindBridge';
    const mentalText = 'Your Mental';
    const healthText = 'Health Matter';
    
    mindBridgeElement.innerHTML = '';
    mentalHealthElements[0].innerHTML = '';
    mentalHealthElements[1].innerHTML = '';
    
    
    await typeWriter(mindBridgeElement, mindBridgeText, 150);
    
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await typeWriter(mentalHealthElements[0], mentalText, 120);
    
    
    await new Promise(resolve => setTimeout(resolve, 300));
    await typeWriter(mentalHealthElements[1], healthText, 120);
}

// Start animation when page loads
document.addEventListener('DOMContentLoaded', animateTexts);
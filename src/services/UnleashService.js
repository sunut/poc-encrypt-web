class UnleashService {
    constructor() {
        this.toggleState = {
            isProdUnlocked: false,
            unlockAttempts: 0,
            lastAttemptTime: null,
            cooldownPeriod: 5 * 60 * 1000, // 5 minutes cooldown
            maxAttempts: 3,
        };

        // Secret combination for unlocking
        this.secretCombination = ['-', '-', 'p'];
        this.currentCombination = [];
        this.combinationTimeout = null;
    }

    // Reset combination after a delay
    resetCombination() {
        this.currentCombination = [];
    }

    // Handle key sequence
    handleKeyPress(key) {
        if (this.toggleState.unlockAttempts >= this.toggleState.maxAttempts) {
            const now = Date.now();
            if (now - this.toggleState.lastAttemptTime < this.toggleState.cooldownPeriod) {
                const remainingTime = Math.ceil(
                    (this.toggleState.cooldownPeriod - (now - this.toggleState.lastAttemptTime)) / 1000 / 60
                );
                return {
                    success: false,
                    message: `Too many attempts. Please wait ${remainingTime} minutes.`,
                };
            }
            // Reset attempts after cooldown
            this.toggleState.unlockAttempts = 0;
        }

        // Clear timeout if exists
        if (this.combinationTimeout) {
            clearTimeout(this.combinationTimeout);
        }

        // Add key to combination
        this.currentCombination.push(key);

        // Set timeout to reset combination
        this.combinationTimeout = setTimeout(() => this.resetCombination(), 2000);

        // Check if combination matches
        const isMatch = this.checkCombination();
        if (isMatch !== null) {
            if (!isMatch) {
                this.toggleState.unlockAttempts++;
                this.toggleState.lastAttemptTime = Date.now();
                return {
                    success: false,
                    message: `Invalid combination. ${this.toggleState.maxAttempts - this.toggleState.unlockAttempts} attempts remaining.`,
                };
            }
            // Reset on successful unlock
            this.toggleState.unlockAttempts = 0;
            this.toggleState.isProdUnlocked = !this.toggleState.isProdUnlocked;
            return {
                success: true,
                message: this.toggleState.isProdUnlocked ? 'Production environment unlocked!' : 'Production environment locked.',
            };
        }

        return null; // Still collecting combination
    }

    // Check if current combination matches secret
    checkCombination() {
        if (this.currentCombination.length < this.secretCombination.length) {
            return null; // Not enough keys yet
        }

        // Check last n keys where n is the length of secret combination
        const lastKeys = this.currentCombination.slice(-this.secretCombination.length);
        const isMatch = this.secretCombination.every((key, index) => key === lastKeys[index]);
        
        // Reset combination after check
        this.resetCombination();
        
        return isMatch;
    }

    // Get current state
    getState() {
        return {
            isProdUnlocked: this.toggleState.isProdUnlocked,
            isLocked: this.toggleState.unlockAttempts >= this.toggleState.maxAttempts,
            remainingAttempts: Math.max(0, this.toggleState.maxAttempts - this.toggleState.unlockAttempts),
        };
    }

    // Force lock production environment
    lockProduction() {
        this.toggleState.isProdUnlocked = false;
        return {
            success: true,
            message: 'Production environment locked.',
        };
    }
}

// Create singleton instance
const unleashService = new UnleashService();
export default unleashService; 
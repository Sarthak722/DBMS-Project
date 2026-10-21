/**
 * Escape Room & Puzzle Hunt System - Centralized API Client
 * Interfaces with Modular Java REST Backend (Part 1 to Part 4)
 */

const API_BASE = ''; // Same origin (relative URL)

const api = {
  // Generic fetch wrapper
  async request(endpoint, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }
      return data.data !== undefined ? data.data : data;
    } catch (err) {
      console.error(`[API ERROR] ${options.method || 'GET'} ${endpoint}:`, err);
      throw err;
    }
  },

  // ==========================================
  // PART 1: Venues & Mystery Rooms
  // ==========================================
  part1: {
    // Branches
    getBranches() {
      return api.request('/api/part1/branches');
    },
    createBranch(branch) {
      return api.request('/api/part1/branches', {
        method: 'POST',
        body: JSON.stringify(branch)
      });
    },
    deleteBranch(id) {
      return api.request(`/api/part1/branches?id=${id}`, {
        method: 'DELETE'
      });
    },

    // Rooms
    getRooms() {
      return api.request('/api/part1/rooms');
    },
    createRoom(room) {
      return api.request('/api/part1/rooms', {
        method: 'POST',
        body: JSON.stringify(room)
      });
    },
    updateRoomStatus(roomId, status) {
      return api.request('/api/part1/rooms', {
        method: 'PUT',
        body: JSON.stringify({ roomId, status })
      });
    },
    deleteRoom(id) {
      return api.request(`/api/part1/rooms?id=${id}`, {
        method: 'DELETE'
      });
    },

    // Staff
    getStaff() {
      return api.request('/api/part1/staff');
    },
    createStaff(staff) {
      return api.request('/api/part1/staff', {
        method: 'POST',
        body: JSON.stringify(staff)
      });
    },
    deleteStaff(id) {
      return api.request(`/api/part1/staff?id=${id}`, {
        method: 'DELETE'
      });
    },

    // Clues
    getClues() {
      return api.request('/api/part1/clues');
    },
    createClue(clue) {
      return api.request('/api/part1/clues', {
        method: 'POST',
        body: JSON.stringify(clue)
      });
    },
    deleteClue(id) {
      return api.request(`/api/part1/clues?id=${id}`, {
        method: 'DELETE'
      });
    }
  },

  // ==========================================
  // PART 2: Teams & Players
  // ==========================================
  part2: {
    getTeams() {
      return api.request('/api/part2/teams');
    },
    createTeam(teamName) {
      return api.request('/api/part2/teams', {
        method: 'POST',
        body: JSON.stringify({ teamName })
      });
    },
    deleteTeam(id) {
      return api.request(`/api/part2/teams?id=${id}`, {
        method: 'DELETE'
      });
    },

    getPlayers() {
      return api.request('/api/part2/players');
    },
    createPlayer(player) {
      return api.request('/api/part2/players', {
        method: 'POST',
        body: JSON.stringify(player)
      });
    },
    assignPlayerToTeam(playerId, teamId) {
      return api.request('/api/part2/players/assign', {
        method: 'PUT',
        body: JSON.stringify({ playerId, teamId })
      });
    },
    deletePlayer(id) {
      return api.request(`/api/part2/players?id=${id}`, {
        method: 'DELETE'
      });
    },
    getRostersView() {
      return api.request('/api/part2/rosters');
    }
  },

  // ==========================================
  // PART 3: Bookings & Live Game Operations
  // ==========================================
  part3: {
    getBookings(sessionId = '') {
      const q = sessionId ? `?session=${encodeURIComponent(sessionId)}` : '';
      return api.request(`/api/part3/bookings${q}`);
    },
    createBooking(booking) {
      return api.request('/api/part3/bookings', {
        method: 'POST',
        body: JSON.stringify(booking)
      });
    },
    updateBookingStatus(sessionId, status) {
      return api.request('/api/part3/bookings/status', {
        method: 'PUT',
        body: JSON.stringify({ sessionId, status })
      });
    },
    completeSession(sessionId, completeTime, outcome) {
      return api.request('/api/part3/bookings/complete', {
        method: 'POST',
        body: JSON.stringify({ sessionId, completeTime, outcome })
      });
    },
    deleteBooking(id) {
      return api.request(`/api/part3/bookings?id=${id}`, {
        method: 'DELETE'
      });
    },
    getHints(sessionId) {
      return api.request(`/api/part3/hints?session=${encodeURIComponent(sessionId)}`);
    },
    logHint(clueId, sessionId) {
      return api.request('/api/part3/hints', {
        method: 'POST',
        body: JSON.stringify({ clueId, sessionId })
      });
    }
  },

  // ==========================================
  // PART 4: Billing, Payments & Analytics
  // ==========================================
  part4: {
    getPayments() {
      return api.request('/api/part4/payments');
    },
    createPayment(payment) {
      return api.request('/api/part4/payments', {
        method: 'POST',
        body: JSON.stringify(payment)
      });
    },
    updatePaymentStatus(paymentId, paymentStatus, paymentMode) {
      return api.request('/api/part4/payments/status', {
        method: 'PUT',
        body: JSON.stringify({ paymentId, paymentStatus, paymentMode })
      });
    },
    getAnalytics() {
      return api.request('/api/part4/analytics');
    },
    getLeaderboard() {
      return api.request('/api/part4/leaderboard');
    },
    getPhoneViews() {
      return api.request('/api/part4/views/phones');
    }
  }
};

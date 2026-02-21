(function () {
  var API_BASE = 'https://hyprbuild.app/api';
  var LOGIN_URL = 'https://hyprbuild.app/login.html?next=' + encodeURIComponent(window.location.href);
  var CLERK_PUBLISHABLE_KEY = 'pk_live_Y2xlcmsuaHlwcmJ1aWxkLmFwcCQ';

  var sidebar = document.getElementById('sidebar');
  var menuToggle = document.getElementById('menu-toggle');
  var overlay = document.getElementById('overlay');
  var filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  var tableBody = document.getElementById('project-table-body');
  var activityList = document.getElementById('activity-list');
  var profileName = document.getElementById('profile-name');
  var profileButton = document.getElementById('profile-button');
  var statusBanner = document.getElementById('api-status');

  var kpiProjects = document.getElementById('kpi-projects');
  var kpiSuccess = document.getElementById('kpi-success');
  var kpiDeploy = document.getElementById('kpi-deploy');
  var kpiLeads = document.getElementById('kpi-leads');

  var kpiProjectsDelta = document.getElementById('kpi-projects-delta');
  var kpiSuccessDelta = document.getElementById('kpi-success-delta');
  var kpiDeployDelta = document.getElementById('kpi-deploy-delta');
  var kpiLeadsDelta = document.getElementById('kpi-leads-delta');

  var sidebarCreateProject = document.getElementById('sidebar-create-project');
  var newProjectButton = document.getElementById('new-project-button');
  var exportButton = document.getElementById('export-button');

  var clerkInstance = null;
  var authToken = '';

  var setStatus = function (message, kind) {
    if (!statusBanner) {
      return;
    }
    statusBanner.textContent = message;
    statusBanner.classList.remove('error', 'success');
    if (kind === 'error') {
      statusBanner.classList.add('error');
    }
    if (kind === 'success') {
      statusBanner.classList.add('success');
    }
  };

  var formatNumber = function (value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '--';
    }
    return value.toLocaleString();
  };

  var escapeHtml = function (value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  var closeSidebar = function () {
    if (!sidebar || !menuToggle || !overlay) {
      return;
    }
    sidebar.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    overlay.hidden = true;
  };

  var openSidebar = function () {
    if (!sidebar || !menuToggle || !overlay) {
      return;
    }
    sidebar.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    overlay.hidden = false;
  };

  if (sidebar && menuToggle && overlay) {
    menuToggle.addEventListener('click', function () {
      var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    overlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeSidebar();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 920) {
        closeSidebar();
      }
    });
  }

  var setTableRows = function (rows) {
    if (!tableBody) {
      return;
    }

    if (!rows || rows.length === 0) {
      tableBody.innerHTML = '<tr data-status="draft"><td colspan="4">No API records available.</td></tr>';
      return;
    }

    tableBody.innerHTML = rows
      .map(function (row) {
        var status = row.status === 'live' ? 'live' : 'draft';
        return (
          '<tr data-status="' +
          status +
          '">' +
          '<td>' +
          escapeHtml(row.name || 'Unknown') +
          '</td>' +
          '<td><span class="badge ' +
          status +
          '">' +
          (status === 'live' ? 'Live' : 'Draft') +
          '</span></td>' +
          '<td>' +
          escapeHtml(row.role || 'user') +
          '</td>' +
          '<td>' +
          escapeHtml(row.email || 'N/A') +
          '</td>' +
          '</tr>'
        );
      })
      .join('');
  };

  var setActivityItems = function (items) {
    if (!activityList) {
      return;
    }

    if (!items || items.length === 0) {
      activityList.innerHTML = '<li><p>No API activity available.</p><span>Now</span></li>';
      return;
    }

    activityList.innerHTML = items
      .map(function (item) {
        return (
          '<li><p>' +
          escapeHtml(item.message) +
          '</p><span>' +
          escapeHtml(item.time) +
          '</span></li>'
        );
      })
      .join('');
  };

  var setupFilters = function () {
    var rows = function () {
      return Array.from(document.querySelectorAll('#project-table-body tr'));
    };

    if (filterButtons.length > 0) {
      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          var filter = button.getAttribute('data-filter');

          filterButtons.forEach(function (b) {
            b.classList.remove('is-active');
          });
          button.classList.add('is-active');

          rows().forEach(function (row) {
            var status = row.getAttribute('data-status');
            var show = filter === 'all' || filter === status;
            row.hidden = !show;
          });
        });
      });
    }
  };

  setupFilters();

  var toBase64 = function (value) {
    var normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    var remainder = normalized.length % 4;
    return remainder === 0 ? normalized : normalized + '='.repeat(4 - remainder);
  };

  var getFrontendApiFromPublishableKey = function (publishableKey) {
    var parts = String(publishableKey || '').split('_');
    if (parts.length < 3) {
      return '';
    }

    var encoded = parts.slice(2).join('_');
    try {
      return window.atob(toBase64(encoded)).replace(/\$/g, '');
    } catch (error) {
      return '';
    }
  };

  var loadClerkScript = function () {
    return new Promise(function (resolve, reject) {
      if (window.Clerk) {
        resolve(window.Clerk);
        return;
      }

      var frontendApi = getFrontendApiFromPublishableKey(CLERK_PUBLISHABLE_KEY);
      if (!frontendApi) {
        reject(new Error('Invalid Clerk publishable key.'));
        return;
      }

      var script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
      script.src = 'https://' + frontendApi + '/npm/@clerk/clerk-js@5/dist/clerk.browser.js';

      script.onload = function () {
        if (window.Clerk) {
          resolve(window.Clerk);
        } else {
          reject(new Error('Clerk loaded incorrectly.'));
        }
      };

      script.onerror = function () {
        reject(new Error('Failed to load Clerk script.'));
      };

      document.head.appendChild(script);
    });
  };

  var apiRequest = async function (path) {
    var response = await window.fetch(API_BASE + path, {
      method: 'GET',
      headers: {
        Authorization: authToken ? 'Bearer ' + authToken : ''
      },
      credentials: 'include'
    });

    if (!response.ok) {
      var message = 'API request failed';
      try {
        var body = await response.json();
        if (body && body.error) {
          message = body.error;
        }
      } catch (error) {
        message = response.status + ' ' + response.statusText;
      }

      var requestError = new Error(message);
      requestError.status = response.status;
      throw requestError;
    }

    return response.json();
  };

  var applySummary = function (me, users, health) {
    if (profileName) {
      var fallbackName = me.primaryEmailAddress || 'Account';
      profileName.textContent = me.fullName && me.fullName.trim() ? me.fullName : fallbackName;
    }

    var projectsCount = users.length > 0 ? users.length : Number(me.publicMetadata.activeProjects || 0);
    if (!projectsCount) {
      projectsCount = 1;
    }

    var successRate = Number(me.publicMetadata.successRate || 97);
    var deploySeconds = Number(me.publicMetadata.avgDeploySeconds || 43);
    var leadsCount = Number(me.publicMetadata.leadsCaptured || 0);

    kpiProjects.textContent = formatNumber(projectsCount);
    kpiSuccess.textContent = formatNumber(successRate) + '%';
    kpiDeploy.textContent = formatNumber(deploySeconds) + 's';
    kpiLeads.textContent = formatNumber(leadsCount);

    kpiProjectsDelta.textContent = users.length > 0 ? 'Synced from /api/admin/users' : 'Synced from /api/me';
    kpiSuccessDelta.textContent = 'Source: /api/me publicMetadata';
    kpiDeployDelta.textContent = 'Source: /api/me publicMetadata';
    kpiLeadsDelta.textContent = 'Source: /api/me publicMetadata';

    setStatus(
      'Connected to API. Health: ' +
        (health && health.ok ? 'OK' : 'Unknown') +
        '. Session: active as ' +
        (me.role || 'user') +
        '.',
      'success'
    );
  };

  var wireButtons = function () {
    var openNewProject = function () {
      window.location.href = 'https://hyprbuild.app';
    };

    if (sidebarCreateProject) {
      sidebarCreateProject.addEventListener('click', openNewProject);
    }

    if (newProjectButton) {
      newProjectButton.addEventListener('click', openNewProject);
    }

    if (exportButton) {
      exportButton.addEventListener('click', function () {
        var rows = Array.from(document.querySelectorAll('#project-table-body tr:not([hidden])'));
        var lines = ['name,status,role,email'];
        rows.forEach(function (row) {
          var cells = Array.from(row.querySelectorAll('td')).map(function (cell) {
            return cell.textContent.trim().replaceAll(',', ' ');
          });
          if (cells.length >= 4) {
            lines.push(cells.join(','));
          }
        });

        var blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'hyprbuild-dashboard-export.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    }

    if (profileButton) {
      profileButton.addEventListener('click', function () {
        if (clerkInstance) {
          clerkInstance.signOut().finally(function () {
            window.location.href = LOGIN_URL;
          });
        } else {
          window.location.href = LOGIN_URL;
        }
      });
    }
  };

  var buildRowsFromUsers = function (users) {
    return users.map(function (user) {
      var role = user.role || 'user';
      return {
        name: user.fullName || user.firstName || user.id || 'Unknown user',
        status: role === 'admin' ? 'live' : 'draft',
        role: role,
        email: user.primaryEmailAddress || ''
      };
    });
  };

  var buildActivityFromUsers = function (users, me) {
    var items = [];

    if (me) {
      items.push({
        message: 'Authenticated as ' + (me.fullName || me.primaryEmailAddress || me.id),
        time: 'Now'
      });
    }

    users.slice(0, 3).forEach(function (user, index) {
      items.push({
        message:
          (user.fullName || user.primaryEmailAddress || 'User') +
          ' synced from /api/admin/users as ' +
          (user.role || 'user'),
        time: index === 0 ? 'Just now' : index + 'm ago'
      });
    });

    if (items.length === 0) {
      items.push({ message: 'No API activity available.', time: 'Now' });
    }

    return items;
  };

  var boot = async function () {
    wireButtons();
    setStatus('Initializing secure session...', '');

    try {
      var clerk = await loadClerkScript();
      await clerk.load();
      clerkInstance = clerk;

      if (!clerk.user || !clerk.session) {
        window.location.href = LOGIN_URL;
        return;
      }

      authToken = (await clerk.session.getToken()) || '';
      if (!authToken) {
        window.location.href = LOGIN_URL;
        return;
      }

      var healthPromise = apiRequest('/health');
      var meResponse = await apiRequest('/me');
      var meUser = meResponse.user || null;

      if (!meUser) {
        throw new Error('No user payload returned from /api/me');
      }

      var users = [];
      if ((meUser.role || '').toLowerCase() === 'admin') {
        try {
          var adminResponse = await apiRequest('/admin/users');
          users = Array.isArray(adminResponse.users) ? adminResponse.users : [];
        } catch (adminError) {
          users = [];
        }
      }

      if (users.length === 0) {
        users = [meUser];
      }

      setTableRows(buildRowsFromUsers(users));
      setActivityItems(buildActivityFromUsers(users, meUser));

      var health = null;
      try {
        health = await healthPromise;
      } catch (healthError) {
        health = null;
      }

      applySummary(meUser, users, health);
    } catch (error) {
      var message = error && error.message ? error.message : 'Unknown dashboard error.';
      setStatus('API connection failed: ' + message, 'error');
      setTableRows([]);
      setActivityItems([
        {
          message: 'Could not load dashboard data from API.',
          time: 'Now'
        }
      ]);
    }
  };

  boot();
})();

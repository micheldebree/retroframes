(function() {
  'use strict';

  angular
    .module('retroframes2')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();

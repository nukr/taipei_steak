function calculateBill() {
  var bill = $('tr .bill-price');
  var totalPrice = 0;
  var totalQuantity = 0;
  for (var i = 0; i < bill.length; i += 1) {
    var $bill = $(bill[i]);
    var billPrice = $bill.text();
    var billQuantity = $bill.siblings('.bill-quantity').text()
    totalPrice = totalPrice + billPrice * billQuantity;
    totalQuantity += parseInt(billQuantity);
  }
  if ($('.checkboxDiscount').is(':checked') === true) {
    var serviceTip = Math.round(totalPrice * 0.1);
    totalPrice = Math.round(totalPrice * 0.88 + serviceTip);
  } else {
    var serviceTip = Math.round(totalPrice * 0.1);
    totalPrice = Math.round(totalPrice + serviceTip);
  }
  $('.bill-total-price').text(totalPrice);
  $('.bill-total-quantity').text('共' + totalQuantity + '客');
  $('.bill-service-tip').text(serviceTip);
}

function OrderCtrl($scope) {
  $scope.selectMeal = function (e) {
    var price = $(e.currentTarget).find('.price').text();
    var name = $(e.currentTarget).find('.meal-name').text();
    var id = e.currentTarget.href.split('/'), id = id[id.length-1];
    var tr = '<tr><td>' + name + '</td><td>' + price + '</td><td></td><td><a href="#"><i class="minia-icon-trashcan"></i></a></td></tr>'
    var exist = $('.' + id).html();
    if (exist === undefined) {
      var $listTr = $('<tr class="bill-row">');
      $listTr.append('<td class="' + id + ' meal-name">' + name + '</td>');
      $listTr.append('<td class="bill-price">' + price + '</td>');
      $listTr.append('<td class="bill-quantity">' + $(e.currentTarget).find('.quantity').val() + '</td>');
      $listTr.append('<td><a href="#"><i class="minia-icon-trashcan"></i></a></td>');
      $listTr.append('<input type="hidden" class="meal-id" value="' + id + '">');
      $('tr.credit').before($listTr);
    } else {
      var quan = $('.' + id).siblings('.bill-quantity');
      quan.text(parseInt(quan.text()) + parseInt($('.quantity').val()));
    }
    $(e.currentTarget).find('.well').animate({backgroundColor: "ff0000"}, 1000);
    calculateBill();
    e.preventDefault();
  };

  $scope.billGen = function () {
    var billRow = $('tr.bill-row');
    bill = {};
    bill.date =new Date();
    bill.dishes = [];
    bill.quantity = [];
    for (var i = 0; i < billRow.length; i += 1) {
      var mealName = $(billRow[i]).find('.meal-name').text();
      var mealPrice = $(billRow[i]).find('.bill-price').text();
      var mealQuantity = $(billRow[i]).find('.bill-quantity').text();
      bill.dishes.push({name: mealName, price: mealPrice, quantity: mealQuantity});
    }
    bill.no = $('#billno').val();
    bill.credit = $('.checkboxCredit').is(':checked')
    bill.discount = $('.checkboxDiscount').is(':checked')
    bill.shift = $('a.shift').eq(0).attr('data-shift')
    bill.creator = $('a.creator').eq(0).text()
    var text = $.trim($('#billno').val());
    if (text.length === 0) {
      $('#myModalLabel').text('請輸入單號');
      $('#myModal').modal('show');
    } else if(bill.dishes.length === 0) {
      $('#myModalLabel').text('請選擇餐點');
      $('#myModal').modal('show');
    } else {
      var posting = $.post('/bill/add', {"bill": bill});
      posting.done(function (data) {
        window.location.reload();
      });
    }
  };

  $scope.removeFormBill = function () {
  }
}

$(document).ready(function () {

  $('a[href="#add-meal"]').tab('show');
  $('a[href="#bills"]').tab('show');
  $('a[href="#normal"]').tab('show');
  $('.archive').click(function () {
    $.get(this.href, function () {
      window.location.reload();
    });
    return false;
  });
  $(document).bind('contextmenu', function (e) {
    e.preventDefault();
  });

  $('.print').click(function () {
    window.print();
  });

  $('#billno').focus();

  $('.affix').on('click', '.minia-icon-trashcan', function () {
    $(this).closest('tr').remove();
    calculateBill();
    return false;
  });

  $(':checkbox').iphoneStyle({
    checkedLabel: 'YES',
    uncheckedLabel: 'NO'
  });

  $('.iPhoneCheckContainer').eq(1).click(function () {
    calculateBill();
  });

});

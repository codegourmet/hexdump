const Conversion = {
    byteToHexString: function (value) {
        var hex = value.toString(16)

        if (hex.length === 2 ) {
            return hex
        } else {
            return '0' + hex
        }
    },

    byteToAscii: function (value) {
        var min = 'a'.charCodeAt(0)
        var max = 'z'.charCodeAt(0)

        if (value < min || value > max) {
            return '.'
        } else {
            return String.fromCharCode(value)
        }
    }
}

var Hexdump = function (table, options) {
    var defaultOptions = {
        chunkSize: 3
    }

    var tableBody = null

    function convertChunk(chunk, byteConversionMethod) {
        var result = []

        for (var i = 0; i < chunk.length; i ++) {
            result.push(byteConversionMethod(chunk[i]))
        }

        return result
    }

    function getChunk(data, offset) {
        var end = Math.min(offset + options.chunkSize, data.length)
        return data.slice(offset, end) // slice: end element not included
    }

    function createOffsetColumn(rowElement, offset) {
        rowElement.append('<td class="offset">' + offset + '</td>')
    }

    function createHexColumn(rowElement, chunk) {
        var hex = convertChunk(chunk, Conversion.byteToHexString)
        rowElement.append('<td class="hex">' + hex.join(' ') + '</td>')
    }

    function createAsciiColumn(rowElement, chunk) {
        var ascii = convertChunk(chunk, Conversion.byteToAscii)
        rowElement.append('<td class="ascii">' + ascii.join('') + '</td>')
    }

    function createRow(offset, chunk) {
        var rowElement = $('<tr class="row"></tr>')
        tableBody.append(rowElement)

        createOffsetColumn(rowElement, offset)
        createHexColumn(rowElement, chunk)
        createAsciiColumn(rowElement, chunk)
    }

    function createRows(data) {
        var numRows = Math.ceil(data.length / options.chunkSize)

        for (var row = 0; row < numRows; row ++) {
            var offset = row * options.chunkSize
            var chunk = getChunk(data, offset)

            createRow(offset, chunk)
        }
    }

    function clearTable() {
        tableBody.find('tr').remove()
    }

    function create(data) {
        clearTable()
        createRows(data)
    }

    options = $.extend({}, defaultOptions, options)
    tableBody = $(table).find('tbody')

    return {
        create: create
    }
}

/* source: https://stackoverflow.com/a/49273187 */
function decodeBase64String(data, callback) {
    var req = new XMLHttpRequest;
    req.open('GET', "data:application/octet;base64," + data);
    req.responseType = 'arraybuffer';
    req.onload = function fileLoaded(e) {
        var byteArray = new Int8Array(e.target.response);
        callback(byteArray)
    }
    req.send()
}

function onSubmit(form, hexdump) {
    var inputData = form.find('textarea').val()
    var decoded = decodeBase64String(inputData, function (result) {
        hexdump.create(result)
    })
}

$(document).ready(function () {
    var table = $('#hexdump table')
    var hexdump = new Hexdump(table, {
        chunkSize: 16
    })

    var form = $('#hexdump form#base64-input')
    form.on('submit', function (e) {
        e.preventDefault()
        onSubmit(form, hexdump)
        return false
    })
})

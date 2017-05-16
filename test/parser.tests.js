const tap = require("tap")

const { default: oh, map } = require("../dist/simple-opening-hours")

tap.test("nach vereinbarung", t => {
  const openingHours = new oh("\"Nach Vereinbarung\"")
  t.notOk(openingHours.isOpen(new Date()))
  t.end()
})

tap.test("24/7", t => {
  t.ok((new oh("24/7")).isOpen())
  t.ok((new oh(" 24/7")).isOpen())
  t.ok((new oh(" 24/7 ")).isOpen())
  t.ok((new oh("24/7 ")).isOpen())
  t.ok((new oh("24 / 7")).isOpen())
  t.ok((new oh("24/7")).getTable())
  t.ok((new oh("24/7")).alwaysOpen)
  t.end()
})

tap.test("off", t => {
  t.notOk((new oh("off")).isOpen())
  t.notOk((new oh(" off")).isOpen())
  t.notOk((new oh("off ")).isOpen())
  t.notOk((new oh(" off ")).isOpen())
  t.ok((new oh("off")).alwaysClosed)
  t.end()
})

tap.test("isOpen", t => {
  t.ok((new oh("Mo-Sa 06:00-22:00")).isOpen(new Date('2016-10-01 18:00')))
  // wrong dayrange
  t.notOk((new oh("So-Sa 06:00-22:00")).isOpen(new Date('2016-10-01 18:00')))
  // broken dayrange
  t.notOk((new oh("So- 06:00-22:00")).isOpen(new Date('2016-10-01 18:00')))
  t.ok((new oh("Mo-Sa 06:00-15:00,16:00-22:00")).isOpen(new Date('2016-10-01 18:00')))
  t.ok((new oh("Mo-Sa 06:00-15:00,16:00-22:00")).isOpen(new Date('2016-10-01 8:00')))
  t.notOk((new oh("Mo 06:00-22:00")).isOpen(new Date('2016-10-01 18:00')))
  t.ok((new oh("Mo-Sa 09:00+")).isOpen(new Date('2016-10-01 18:00')))
  t.notOk((new oh("Mo-Sa off")).isOpen(new Date('2016-10-01 18:00')))
  t.ok( (new oh("Mo-So 10:00-20:00")).isOpen(new Date('2017-05-14 18:00')) )
  t.ok((new oh("Mo-So 10:00-20:00; We off")).isOpen(new Date('2017-04-30 18:00')))

  t.notOk((new oh("Mo-Sa 06:00-22:00")).isOpen(new Date('2016-10-01 05:00')))
  t.ok((new oh("Mo-Sa 06:00-22:00")).getTable())
  t.ok((new oh("off")).getTable())
  t.end()
})

tap.test("Simple Time tables", t => {
    const table = (new oh("Mo-Sa 06:00-22:00")).getTable()
    t.same(table, {
        su: [],
        mo: ["06:00-22:00"],
        tu: ["06:00-22:00"],
        we: ["06:00-22:00"],
        th: ["06:00-22:00"],
        fr: ["06:00-22:00"],
        sa: ["06:00-22:00"],
        ph: [],

    })
    t.end()
})

tap.test("Complex Time tables", t => {
    const table = (new oh("Mo-Sa 06:00-14:00,15:00-22:00")).getTable()
    t.same(table, {
        su: [],
        mo: ["06:00-14:00", "15:00-22:00"],
        tu: ["06:00-14:00", "15:00-22:00"],
        we: ["06:00-14:00", "15:00-22:00"],
        th: ["06:00-14:00", "15:00-22:00"],
        fr: ["06:00-14:00", "15:00-22:00"],
        sa: ["06:00-14:00", "15:00-22:00"],
        ph: [],

    })
    t.end()
})

tap.test("map Time tables", t => {
    const openingHours = new oh("Mo 06:00-14:00, 15:00-18:00; Tu-Sa 06:00-14:00")
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const result = map(openingHours, (weekday, times) => {
        if (times && times.length) {
            return weekdays[weekday] + " " + times.map(time => time).join(" ")
        } else {
            return weekdays[weekday] + " Closed"
        }
    }).join("\n")
    t.equal(result, "Mon 06:00-14:00 15:00-18:00\nTue 06:00-14:00\n" +
                    "Wed 06:00-14:00\nThu 06:00-14:00\nFri 06:00-14:00\n" +
                    "Sat 06:00-14:00\nSun Closed")
    t.end()
})

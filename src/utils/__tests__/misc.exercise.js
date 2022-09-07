import { formatDate } from "utils/misc"

test('formatDate formats the date to look nice', () => {
    const niceDate = formatDate(new Date('09-06-2022'))

    expect(niceDate).toBe('Sep 22')
})

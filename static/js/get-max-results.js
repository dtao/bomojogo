function getMaxResults(period, offset) {
    if (!period) {
        return null;
    }

    try {
        var parsed = period.match(/^(\d+)([dw])$/),
            value = Number(parsed[1]),
            unit = parsed[2];
    } catch (e) {
        return null;
    }

    switch (unit) {
        case 'w':
            value *= 7;
        case 'd':
        default:
            break;
    }

    return value + (offset || 0);
}

export default getMaxResults;

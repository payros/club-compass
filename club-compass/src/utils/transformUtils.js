import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import { fromDateToString } from '@/utils/dateUtils'
import { ADVENTURER_CLASSES } from '@/utils/consts'

function transformStaffMember(data) {
  return {
    ...data,
    backgroundCheckExpiration: data.backgroundCheckExpiration ? fromDateToString(data.backgroundCheckExpiration) : null,
    createdAt: data.createdAt ? fromDateToString(data.createdAt) : null,
  }
}

function transformAward(data) {
  const type = data.type ? fromSnakeCaseToTitleCase(data.type) : null
  return {
    ...data,
    level: data.level ? fromSnakeCaseToTitleCase(data.level) : 'No level (multi-level award)',
    type: type ?? '—',
    link: data.link || null,
    linkLabel: data.link ? `${data.name ?? ''} ${type ?? ''} requirements`.trim() : '—',
    patchImageUrl: data.patchImageUrl || null,
    childrenAwarded: (data.childrenAwarded ?? []).map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      class: c.class ? fromSnakeCaseToTitleCase(c.class) : '',
      earnedOn: c.earnedOn ? fromDateToString(c.earnedOn) : '—',
      eventId: c.eventId,
    })),
  }
}

function transformClass(data) {
  return {
    ...data,
    imageUrl: ADVENTURER_CLASSES[data.class]?.url ?? null,
    imagePadding: ADVENTURER_CLASSES[data.class]?.padding ?? 10,
  }
}

export { transformStaffMember, transformAward, transformClass }

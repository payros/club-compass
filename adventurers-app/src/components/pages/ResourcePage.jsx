"use client"
import { Card, Text, Skeleton } from "@chakra-ui/react"
import TableCard from "@/components/TableCard"
import PageLayout from "@/components/PageLayout"
import PageTransition from "@/components/PageTransition"

/**
 * ResourcePage — Info card at top + relation table cards below
 * @param {Array} breadcrumbs
 * @param {string} clubName
 * @param {ReactNode} actions
 * @param {string} title
 * @param {string} subtitle
 * @param {boolean} loading
 * @param {Array} fields - [{label, value}] for the info grid
 * @param {Array} relatedCards - TableCard props arrays
 */
export default function ResourcePage({
  breadcrumbs,
  clubName,
  actions,
  title,
  subtitle,
  loading,
  fields = [],
  relatedCards = [],
}) {
  return (
    <PageLayout breadcrumbs={breadcrumbs} actions={actions} clubName={clubName}>
      <PageTransition>
        {/* Main info card */}
        <Card.Root className="glass-card" mb={5}>
          <Card.Header>
            <Card.Title className="card-title" fontSize="1.3rem">
              {loading ? <Skeleton height="6" width="200px" style={{ background: "rgba(255,255,255,0.15)" }} /> : title}
            </Card.Title>
            {subtitle && (
              <Card.Description className="card-description">
                {loading ? <Skeleton height="4" width="120px" mt={1} style={{ background: "rgba(255,255,255,0.1)" }} /> : subtitle}
              </Card.Description>
            )}
          </Card.Header>
          <Card.Body pt={0}>
            {loading ? (
              <div className="info-grid">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="info-item">
                    <Skeleton height="3" width="80px" mb={1} style={{ background: "rgba(255,255,255,0.1)" }} />
                    <Skeleton height="5" width="140px" style={{ background: "rgba(255,255,255,0.12)" }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="info-grid">
                {fields.map((field, i) => (
                  <div key={i} className="info-item">
                    <label>{field.label}</label>
                    <p>{field.value ?? "—"}</p>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card.Root>

        {/* Related table cards */}
        {relatedCards.length > 0 && (
          <div className="cards-grid">
            {relatedCards.map((card, i) => (
              <TableCard
                key={i}
                title={card.title}
                description={card.description}
                headers={card.headers}
                data={card.data}
                loading={card.loading}
                onRowClick={card.onRowClick}
                badge={card.badge}
                sortBy={card.sortBy}
                sortDirection={card.sortDirection}
                handleSort={card.handleSort}
                maxH={card.maxH ?? "260px"}
              />
            ))}
          </div>
        )}
      </PageTransition>
    </PageLayout>
  )
}

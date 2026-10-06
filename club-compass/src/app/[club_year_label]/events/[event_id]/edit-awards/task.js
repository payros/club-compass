
1. Quando isAwardCeremony for true, mostrar botao "suggest awards"
2. Quando o botao for clicado, chamar api /api/club-years/{club_year_label}/awards?toBeAwardedAt={event_id} para buscar awards sugeridos
3. no awardService.list() passar o parametro toBeAwardedAt={event_id} para filtrar awards para todos os eventos desde o inicio ate a data do award ceremony do ano que ainda nao foram entregues para as criancas
4. pre-preencher o form com os awards sugeridos, mas nao deletar os que ja estiverem la
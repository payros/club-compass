import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/**
 * Detects the club_year_label from the current path params and returns the
 * matching club year object, or undefined if the path has no club year context
 * or while the data is loading.
 *
 * @returns {{ clubYear: object|undefined, loading: boolean }}
 */
function useClubYear() {
  const params = useParams();
  const clubYearLabel = params?.["club_year_label"];

  const [clubYear, setClubYear] = useState(undefined);
  const [loading, setLoading] = useState(!!clubYearLabel);

  useEffect(() => {
    if (!clubYearLabel) {
      setClubYear(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/club-years/${clubYearLabel}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setClubYear(data ?? undefined);
        setLoading(false);
      })
      .catch(() => {
        setClubYear(undefined);
        setLoading(false);
      });
  }, [clubYearLabel]);

  return { clubYear, loading };
}

export default useClubYear;

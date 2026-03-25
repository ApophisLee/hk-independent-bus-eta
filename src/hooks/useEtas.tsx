import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Eta, fetchEtas } from "hk-bus-eta";
import AppContext from "../context/AppContext";
import useLanguage from "./useTranslation";
import DbContext from "../context/DbContext";

interface UseEtasResult {
  etas: Eta[] | null;
  updatedAt: number | null;
}

export const useEtas = (routeId: string, disable: boolean = false) => {
  const { isVisible, refreshInterval } = useContext(AppContext);
  const {
    db: { routeList, stopList, holidays, serviceDayMap },
  } = useContext(DbContext);
  const [routeKey, seq] = routeId.split("/");
  const routeObj = routeList[routeKey] || DefaultRoute;
  const [etas, setEtas] = useState<Eta[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const language = useLanguage();
  const isMounted = useRef<boolean>(false);

  const fetchData = useCallback(() => {
    if (!isVisible || navigator.userAgent === "prerendering") {
      // skip if prerendering
      setEtas(null);
      setUpdatedAt(null);
      return new Promise((resolve) => resolve([]));
    }
    return fetchEtas({
      ...routeObj,
      seq: parseInt(seq, 10),
      stopList,
      language,
      holidays,
      serviceDayMap,
    }).then((_etas) => {
      if (isMounted.current) {
        setEtas(_etas);
        setUpdatedAt(Date.now());
      }
    });
  }, [isVisible, language, routeObj, seq, stopList, holidays, serviceDayMap]);

  useEffect(() => {
    if (disable) return;
    isMounted.current = true;
    const fetchEtaInterval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    fetchData();

    return () => {
      isMounted.current = false;
      clearInterval(fetchEtaInterval);
    };
  }, [routeId, fetchData, refreshInterval, disable]);

  return { etas, updatedAt } satisfies UseEtasResult;
};

export const formatEtaRefreshTime = (
  updatedAt: number,
  language: "zh" | "en"
) =>
  new Intl.DateTimeFormat(language === "zh" ? "zh-HK" : "en-HK", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(updatedAt);

export const formatDateTimeForAttribute = (value: string) =>
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(value)
    ? value.replace(" ", "T")
    : undefined;

const DefaultRoute = {
  co: [""],
  stops: { "": [""] },
  dest: { zh: "", en: "" },
  bound: "",
  nlbId: 0,
  gtfsId: "",
  fares: [],
  faresHoliday: [],
};
